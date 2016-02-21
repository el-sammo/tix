/**
 * ReservationsController
 *
 * @description :: Server-side logic for managing reservations
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

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
				results.forEach(function(result) {
					entityName = result.entityName;
					entityCostTotal += result.total;
					entityQuantityTotal += result.quantity;
	
					calculatedEntity.entityId = result.entityId;
					calculatedEntity.entityName = result.entityName;
				});

				calculatedEntity.entityName = entityName;
				calculatedEntity.entityCostTotal = entityCostTotal;
				calculatedEntity.entityQuantityTotal = entityQuantityTotal;
				calculatedEntity.entityCostAverage = parseFloat((entityQuantityTotal / entityCostTotal).toFixed(2));

				if((poolData.poolCostTotal - (reservationObligation * calculatedEntity.entityQuantityTotal)) > 0) {
					calculatedEntity.nextCost = (reservationObligation * entityOdds).toFixed(2);
// for sanity checking					
// console.log('FORMULA A - entityOdds: '+entityOdds+' and calculatedEntity.nextCost: '+calculatedEntity.nextCost);
				} else {
					calculatedEntity.nextCost = ((poolData.poolCostTotal - (reservationObligation * calculatedEntity.entityQuantityTotal)) * (1 + entityOdds));
// for sanity checking					
// console.log('FORMULA B - entityOdds: '+entityOdds+' and calculatedEntity.nextCost: '+calculatedEntity.nextCost);
				}
	
	//			res.send({entityCostTotal: entityCostTotal, entityQuantityTotal: entityQuantityTotal});
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
		Reservations.findByPoolId(req.params.id).sort({entityName: 'asc', createdAt: 'asc'}).then(function(results) {
			res.send(JSON.stringify(results));
		}).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
		});
	}
	
};

