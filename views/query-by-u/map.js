/*
map.js
============
--------------------------------------------------------------------------
Name:           map.js
Purpose:        Sort the result by the uranium.

Description:
	Unit:
		Category One
		   ppm (parts per million)
		   ppb (parts per billion)
		   ppt (parts per trillion)
		   1 ppm = 1000 ppb
		   1 ppb = 1000 ppt
		Category Two
		   Bq/kg (becquerels per kg)
		   mBq/kg (milli becquerels per kg)
		   muBq/kg = uBq/kg (micro becquerels per kg) (two different shorthands for the greek letter)
		   1 Bq/kg = 1000 mBq/kg
		   1 mBq/kg = 1000 uBq/kg = 1000 muBq/kg
		Category Three
		   Anything else

Author:         Zheng Li
Email:          Ronnie.alonso@gmail.com

Created:        14 July 2013
Copyright:      (c) Zheng Li 2013
--------------------------------------------------------------------------
*/
function (doc) {
	var U_priority = ["U", "U-238", "238-U", "U238", "238U"];
	var pri_u = 9999;
	var u = {"unit":"-","value":["-"],"isotope":"-","type":"measurement"}

	var unit = {"ppt":{"category":1 , "coefficient":1} , 
				"ppb":{"category":1 , "coefficient":1000} ,
				"ppm":{"category":1 , "coefficient":1000000},
				"nBq/kg":{"category":2 , "coefficient":1},
				"uBq/kg":{"category":2 , "coefficient":1000},
				"muBq/kg":{"category":2 , "coefficient":1000},
				"mBq/kg":{"category":2 , "coefficient":1000000},
				"Bq/kg":{"category":2 , "coefficient":1000000000},
		}

	// go through all the results
	if(doc.type == "measurement"){

		for(var k in doc.measurement.results){
			var item = doc.measurement.results[k];

			// select Th
			for (var i = 0; i < U_priority.length; i++) {
				if (item.isotope == U_priority[i] && i < pri_u){
					u = item;
					pri_u = i;
				}
			};
		}

		uvalue = parseFloat(u.value[0]);
		 // Convert the unit
		if(unit.hasOwnProperty(u.unit)){
			var coefficient = unit[u.unit].coefficient
			var category = unit[u.unit].category
			emit([category , uvalue * coefficient],doc);
		}
		else{
			if(u.unit != "-"){

				emit([3,uvalue],doc);
			}
			else{
				emit([4,uvalue],doc);
			}
		}		 
/*		if(u.unit=="ppt"){
			emit([1,uvalue],doc);
		}else
		if(u.unit=="ppb"){
			emit([1,uvalue*1000],doc);
		}else
		if(u.unit=="ppm"){
			emit([1,uvalue*1000000],doc);
		}else
		if(u.unit=="nBq/kg"){
			emit([2,uvalue],doc);
		}else
		if(u.unit=="uBq/kg"){
			emit([2,uvalue*1000],doc);
		}else
		if(u.unit=="mBq/kg"){
			emit([2,uvalue*1000000],doc);
		}else{
			emit([3,uvalue],doc);
		}*/
	}
};