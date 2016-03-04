/**
 * ReservationsController
 *
 * @description :: Server-side logic for managing reservations
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Promise = require('bluebird');

module.exports = {
  datatables: function(req, res) {
    var options = req.query;

    Reservations.datatables(options).sort({createdAt: 'asc'}).then(function(results) {
      res.send(JSON.stringify(results));
    }).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
    });
  },

	byCustomerId: function(req, res) {
		Reservations.findByCustomerId(req.params.id).sort({createdAt: 'asc'}).then(function(results) {
			res.send(JSON.stringify(results));
		}).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
		});
	},
	
	byEntityId: function(req, res) {
		Reservations.findByEntityId(req.params.id).sort({createdAt: 'asc'}).then(function(results) {
			res.send(JSON.stringify(results));
		}).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
		});
	},

	costByPoolAndEntity: function(req, res) {
		var reqPcs = req.params.id.split("-p&e-");
		var queryPoolId = reqPcs[0];
		var queryEntityId = reqPcs[1];
		var entityOdds = reqPcs[2] / 10000;
		var eeCount = reqPcs[3];

		Reservations.find({poolId: queryPoolId}).sort({entityName: 'asc', createdAt: 'asc'}).then(function(results) {
			var poolCostTotal = 0;
			var poolQuantityTotal = 0;

			var namesMatrix = [];
			var highMatrix = [];

			results.forEach(function(result) {
				var nameIdx = namesMatrix.indexOf(result.entityName);

				if(nameIdx > -1) {
					highMatrix[nameIdx] += result.quantity;
				} else {
					namesMatrix.push(result.entityName);
					highMatrix.push(result.quantity);
				};

				poolCostTotal += result.total;
				poolQuantityTotal += result.quantity;

			});

			var poolHighEntityTeam = '';
			var poolHighEntityCount = 0;
			var first = true;
			namesMatrix.forEach(function(name) {
				if(first) {
					poolHighEntityTeam = name;
					poolHighEntityCount = highMatrix[0];
					highMatrix.shift();
					first = false;
				} else {
					if(highMatrix[0] > poolHighEntityCount) {
						poolHighEntityTeam = name;
						poolHighEntityCount = highMatrix[0];
					}
				}
			});

			var poolData = {
				poolCostTotal: poolCostTotal, 
				poolQuantityTotal: poolQuantityTotal,
				poolHighEntityTeam: poolHighEntityTeam,
				poolHighEntityCount: poolHighEntityCount
			};

			return poolData;

		}).then(function(poolData) {
			Reservations.find({poolId: queryPoolId, entityId: queryEntityId}).sort({createdAt: 'asc'}).then(function(results) {
				var reservationObligation = 1500;
				var entityCostTotal = 0;
				var entityQuantityTotal = 0;
				var calculatedEntity = {};
				var fourthPercent = (eeCount * -.025);
				var thirtyNine = .395;
				var minCost = parseFloat((reservationObligation / (eeCount * 2) ).toFixed(2));
				var maxCost = parseFloat((reservationObligation * thirtyNine).toFixed(2));
				results.forEach(function(result) {
					entityName = result.entityName;
					entityCostTotal += result.total;
					entityQuantityTotal += result.quantity;
	
					calculatedEntity.entityId = result.entityId;
					calculatedEntity.entityName = result.entityName;
				});

				entityCostAverage = (entityCostTotal / entityQuantityTotal).toFixed(2);

				calculatedEntity.entityName = entityName;
				calculatedEntity.entityCostTotal = entityCostTotal;
				calculatedEntity.entityQuantityTotal = entityQuantityTotal;
				calculatedEntity.entityCostAverage = entityCostAverage;

				calculatedEntity.obligationTotal = parseFloat(reservationObligation * calculatedEntity.entityQuantityTotal);

				var decider = parseInt(poolData.poolCostTotal) - parseFloat(calculatedEntity.obligationTotal);
				
				if(decider > 0) {
					var poolEqualizer = calculatedEntity.entityCostAverage * entityOdds;
					calculatedEntity.nextCost = ( (reservationObligation * entityOdds) - poolEqualizer ).toFixed(2);
					if(calculatedEntity.nextCost < minCost) {
						calculatedEntity.nextCost = (parseFloat(calculatedEntity.nextCost) + parseFloat(minCost)).toFixed(2);
					}
				} else {
					if(calculatedEntity.obligationTotal > poolData.poolCostTotal) {
						calculatedEntity.nextCost = maxCost;
					} else {
						if(calculatedEntity.obligationTotal >= (poolData.poolCostTotal * thirtyNine)) {
							calculatedEntity.nextCost = maxCost;
						} else if( (calculatedEntity.obligationTotal >= (poolData.poolCostTotal * .245)) && (calculatedEntity.obligationTotal < (poolData.poolCostTotal * thirtyNine))) {
console.log('multiplying by fourthPercent for '+entityName);
							calculatedEntity.nextCost = (fourthPercent * ( (poolData.poolCostTotal - (reservationObligation * calculatedEntity.entityQuantityTotal) ) * (1 + entityOdds) ) ).toFixed(2);
						} else {
							calculatedEntity.nextCost = (-.1 * ( (poolData.poolCostTotal - (reservationObligation * calculatedEntity.entityQuantityTotal) ) * (1 + entityOdds) ) ).toFixed(2);
						}
					}
				}
	
				res.send(JSON.stringify(calculatedEntity));
			}).catch(function(err) {
	      res.json({error: 'Server error'}, 500);
	      console.error(err);
	      throw err;
			});
		}).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
		});
	
	},
	
	byPoolId: function(req, res) {
		var query = {poolId: req.params.id};
		var sort = {entityName: 'asc', createdAt: 'asc'};
		Reservations.find(query).sort(sort).then(function(results) {
			res.send(JSON.stringify(results));
		}).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
		});
	},
	
	hotReservations: function(req, res) {
		var hotReservationsList = [];
		var query = {poolId: req.params.id};
		var sort = {createdAt: 'desc', cost: 'asc'};

		Reservations.find(query).sort(sort).limit(14).then(function(results) {
			var entityIdList = [];
			results.forEach(function(result) {
				if(entityIdList.indexOf(result.entityId) < 0) {
					entityIdList.push(result.entityId);
				}
			});

			var promises = [];

			var counter = 1;
			_.forEach(entityIdList, function(entityId) {
				if(counter > 8) {
					return false;
				}

				promises.push(
					Entities.find({id: entityId}).then(function(result) {
						hotReservationsList.push(result);
					}).catch(function(err) {
						console.log('entity not found: '+entityId);
					})
				);

				counter++;
			});

			return Promise.all(promises);

		}).then(function() {
			res.json(hotReservationsList);

		}).catch(function(err) {
			res.json({error: 'Server error'}, 500);
			console.error(err);
		});
	}
};

