// initialize the map
	var map = L.map('map').setView([33.55, -7.48], 10);
	var polygonsLayer;

	// load a tile layer
	L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		{
			attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
			maxZoom: 17,
			minZoom: 9
		}).addTo(map);

	// load GeoJSON from an external file
	/*$.getJSON("Maps/Microzones.geojson",function(data){
		// add GeoJSON layer to the map once the file is loaded
		polygonsLayer = L.geoJson(data,{
			onEachFeature: function( feature, layer ){
				layer.bindPopup( "<strong>" + feature.properties.name + "</strong><br/>" + feature.properties.arrondissement )
			}
		}).addTo(map);
	});*/

	var rootUrl = 'http://localhost:8080/geoserver/wfs';

	var defaultParameters = {
		service: 'WFS',
		version: '2.0.0',
		request: 'GetFeature',
		typeName: 'afriquia_gaz:microzones',
		maxFeatures: 200,
		outputFormat: 'text/javascript',
		format_options: 'callback: getJson',
		srsName:'EPSG:4326'

	};

	var parameters = L.Util.extend(defaultParameters);
	//console.log(rootUrl + L.Util.getParamString(parameters));
	$.ajax({
		jsonp : false,
		url: rootUrl + L.Util.getParamString(parameters),
		dataType: 'jsonp',
		jsonpCallback: 'getJson',
		success: handleJson
	});

	var group = new L.featureGroup().addTo(map);
	var geojsonlayer;
	function handleJson(data) {
		//		console.log(data);
		geojsonlayer=L.geoJson(data, {
			style: function (feature) {
				return {
					"weight": 2,
					"opacity": 0.65
				};
			},
			onEachFeature: function (feature, my_Layer) {
				my_Layer.bindPopup("ID : "+feature.properties.id+"<br />Name : "+feature.properties.microzone);
			}
		}).addTo(group);
		map.fitBounds(group.getBounds());
		console.log(geojsonlayer.toGeoJSON());

	}


	function getJson(data) {
		console.log("callback function fired");
	}

	// Initialize the FeatureGroup to store editable layers
	var drawnItems = new L.FeatureGroup();
	map.addLayer(drawnItems);


	// Initialize the draw control and pass it the FeatureGroup of editable layers
	var drawControl = new L.Control.Draw({
		edit: {
				featureGroup: group
		}
	});
	map.addControl(drawControl);

	map.on('draw:created', function (e) {
		var type = e.layerType,
				layer = e.layer;
		if (type === 'marker') {
				// Do marker specific actions
		}
		/*var geojson = e.layer.toGeoJSON();
		var wkt = Terraformer.WKT.convert(geojson.geometry);
		console.log(wkt);
		$.ajax({
			type: 'POST',
			url: 'php/drawFeature.php',
			data: {
				geometry: wkt
			},
			success:function(response){
				alert("microzone ajoutée dans la base de données");
				window.location.reload();
			},
			error:function(response){
				console.log(response);
			}
		})*/
		// Do whatever else you need to. (save to db, add to map etc)
		drawnItems.addLayer(layer);
	});

	map.on('draw:editstart', function () {
		// Update db to save latest changes.
		if(geojsonlayer){
			geojsonlayer.editing.enable();
		}
	});

	map.on('draw:editstop', function (e) {
		// Update db to save latest changes.
		var layers = e.layers;
		layers.eachLayer(function (layer) {
			layer.editing.enable();
			var geojson = layer.toGeoJSON();
			var wkt = Terraformer.WKT.convert(geojson.geometry);
			console.log(wkt);
		});
		
	});

	map.on('draw:deleted', function () {
		// Update db to save latest changes.
	});