/**
 * CustomersController
 *
 * @description :: Server-side logic for managing customers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var bcrypt = require('bcrypt');
var Promise = require('bluebird');

var loginError = 'Invalid username, email, or password.';
var serverError = 'An error occurred. Please try again later.';
var nextUrl = '/#/';
var loginUrl = '/login';
var layout = 'customers/loginLayout';
var view = 'login';

var Authorize = require('auth-net-types');
var _AuthorizeCIM = require('auth-net-cim');
var AuthorizeCIM = new _AuthorizeCIM(sails.config.authorizeNet);

module.exports = {
  createANet: function(req, res) {
    var isAjax = req.headers.accept.match(/application\/json/);

		if(req.body && req.body.customerId) {
			return createANetProfile(req, res);
		}
  },

	createPaymentMethod: function(req, res) {
    var isAjax = req.headers.accept.match(/application\/json/);

		if(req.body && req.body.customerProfileId && req.body.cardNumber && req.body.expirationDate) {
			return createCustomerPaymentProfile(req, res);
		}
	},

  login: function(req, res) {
    var isAjax = req.headers.accept.match(/application\/json/);

    if(req.session.isAuthenticated) {
      if(isAjax) {
        return res.send(JSON.stringify({
          success: true,
					customerId: req.session.customerId
        }));
      }
      return res.redirect(nextUrl);
		}

    if(! req.url.replace(/\?.*/, '').match(loginUrl)) {
      return res.redirect(loginUrl);
    }

    if(req.body && req.body.username && req.body.password) {
      return processLogin(req, res);
    }

    if(isAjax) {
      return res.send(JSON.stringify({
        error: loginError
      }), 401);
    }

    res.view({layout: layout}, view);
  },

  logout: function(req, res) {
    req.session.isAuthenticated = false;
    req.session.customerId = null;
    return res.send(JSON.stringify({success: true}));
  },

	session: function(req, res) {
		var sessionData = {};
		sessionData.order = {};
		var sessionOrder = {};

		// Get order for session
		var p = Orders.find({sessionId: req.sessionID, orphaned: false});
		p.sort({updatedAt: 'desc'}).limit(1).then(function(results) {
			if(results.length > 0) {
				sessionOrder = results[0];
			}

			var customerOrder = {};
			if(! (req.session && req.session.customerId)) {
				return [sessionOrder, customerOrder];
			}

			// Get order for customer
			return Orders.find({
				'customerId': sessionData.customerId, 'orphaned': false
			}).sort({updatedAt: 'desc'}).then(function(results) {
				customerOrder = results[0];
				return [sessionOrder, customerOrder];
			});
		}).spread(function(sessionOrder, customerOrder) {
			// Pick which order is the most recent and attach to sessionData
			sessionOrder.updatedAt || (sessionOrder.updatedAt = 0);
			customerOrder.updatedAt || (customerOrder.updatedAt = 0);
			if(customerOrder.updatedAt >= sessionOrder.updatedAt) {
				sessionData.order = customerOrder;
			} else {
				sessionData.order = sessionOrder;
			}

			// What if neither had any data at all? AKA a new session?
			// I *THINK* we can check for this by determining the 
			// presence of sessionId on sessionData.order
			// I think we instantiate a new order with the req.sessionID
			// attached to the order as sessionData.order.sessionId
			if(!sessionData.order.sessionId) {
				sessionData.order.sessionId = req.sessionID;
				Orders.create(sessionData.order);
			}

			// Also, make sure that if the session order doesn't have a customer id,
			// and a customer id is present, we set the customer id on the session
			// order
			if(! sessionOrder.customerId && req.session && req.session.customerId) {
				sessionOrder.customerId = req.session.customerId;
				Orders.update(sessionOrder.id, {customerId: sessionOrder.customerId});
			}

			// Build rest of sessionData
			if(req && req.sessionID) {
				sessionData.sid = req.sessionID;
			}

			if(req.session && req.session.customerId) {
				sessionData.customerId = req.session.customerId;
			}

			// Send session data
			res.json(sessionData);
		}).catch(function(err) {
			res.json({error: 'Server error'}, 500);
			console.error(err);
		});
  },

	byUsername: function(req, res) {
		Customers.find({username: req.params.id}).sort({fName: 'asc', lName: 'asc'}).limit(20).then(function(results) {
			res.send(JSON.stringify(results));
		}).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
		});
	},
	
  datatables: function(req, res) {
    var options = req.query;

    Customers.datatables(options).then(function(results) {
      res.send(JSON.stringify(results));
    }).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
    });
  }
	
};

function processLogin(req, res, self) {
  Customers.findOne({or: [
    {username: req.body.username},
    {email: req.body.username}
  ]}).then(function(customer) {
    if(! customer) return errorHandler(loginError)();

    var onCompare = bcrypt.compareAsync(
      req.body.password, customer.password
    );
    onCompare.then(function(match) {
      if(! match) return errorHandler(loginError)();

      req.session.isAuthenticated = true;
      req.session.customerId = customer.id;

      respond();

    }).catch(errorHandler(serverError));

  }).catch(errorHandler(serverError));

  ///
  // Convenience subfunctions
  ///

  function respond(err) {
    var isAjax = req.headers.accept.match(/application\/json/);
    var errCode = 400;

    if(err) {
      if(isAjax) {
        if(err == loginError) errCode = 401;
        return res.send(JSON.stringify({error: err}), errCode);
      }

      return res.view({
        layout: layout,
        error: err
      }, view);
    }

    if(isAjax) {
      return res.send(JSON.stringify({success: true, customerId: req.session.customerId}));
    }

    return res.redirect(nextUrl);
  };

  function errorHandler(errMsg) {
    return function(err) {
      if(err) console.error(err);
      respond(errMsg);
    };
  };
}

function createANetProfile(req, res, self) {
  Customers.findOne(req.body.customerId).then(function(customer) {
    if(! customer) {
			console.log('customers ajax failed in CustomersController-createANetProfile()');
	 		return errorHandler(customersError)();
		}

		AuthorizeCIM.createCustomerProfile({customerProfile: {
				merchantCustomerId: 1521518,
				description: customer.id,
				email: customer.email
			}
    }, function(err, response) {
			if(err) {
				return errorHandler(aNetError)();
			}
      return res.send(JSON.stringify({success: true, customerProfileId: response.customerProfileId}));
		});
  });

  ///
  // Convenience subfunctions
  ///

  function respond(err) {
    var isAjax = req.headers.accept.match(/application\/json/);
    var errCode = 400;

    if(err) {
      if(isAjax) {
        if(err == loginError) errCode = 401;
        return res.send(JSON.stringify({error: err}), errCode);
      }

      return res.view({
        layout: layout,
        error: err
      }, view);
    }

    return res.redirect(nextUrl);
  };

  function errorHandler(errMsg) {
    return function(err) {
      if(err) console.error(err);
      respond(errMsg);
    };
  };
}

function createCustomerPaymentProfile(req, res, self) {
	var customerProfileId = req.body.customerProfileId;
	var cardNumber = req.body.cardNumber;
	var expirationDate = req.body.expirationDate; // <-- format: YYYY-MM

	var options = {
		customerType: 'individual',
		payment: new Authorize.Payment({
			creditCard: new Authorize.CreditCard({
				cardNumber: cardNumber,
				expirationDate: expirationDate
			})
		})
	};

	AuthorizeCIM.createCustomerPaymentProfile({
		customerProfileId: customerProfileId,
		paymentProfile: options
	}, function(err, response) {
		if(err) {
			return errorHandler(aNetError)();
		}
    return res.send(JSON.stringify({success: true, customerPaymentProfileId: response.customerPaymentProfileId, lastFour: req.body.cardNumber}));
	});

  ///
  // Convenience subfunctions
  ///

  function respond(err) {
    var isAjax = req.headers.accept.match(/application\/json/);
    var errCode = 400;

    if(err) {
      if(isAjax) {
        if(err == loginError) errCode = 401;
        return res.send(JSON.stringify({error: err}), errCode);
      }

      return res.view({
        layout: layout,
        error: err
      }, view);
    }

    return res.redirect(nextUrl);
  };

  function errorHandler(errMsg) {
    return function(err) {
      if(err) console.error(err);
      respond(errMsg);
    };
  };
}

