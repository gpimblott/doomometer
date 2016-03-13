        function onPopupClose(evt) {
            select.unselectAll();
        }
        
        function onFeatureSelect(event) {
            var feature = event.feature;
 
            var content = "<p id=\"mappopup\"><a href=\""  
            				+ feature.attributes.link + "\" target=\"blank\"> " 
            				+ feature.attributes.name + "</a></p>";
            if (content.search("<script") != -1) {
                content = "Content contained Javascript! Escaped content below.<br>" + content.replace(/</g, "&lt;");
            }
            popup = new OpenLayers.Popup.FramedCloud("myPopup", 
                                     feature.geometry.getBounds().getCenterLonLat(),
                                     new OpenLayers.Size(100,100),
                                     content,
                                     null, true, onPopupClose);
            feature.popup = popup;
            map.addPopup(popup);
        }
        function onFeatureUnselect(event) {
            var feature = event.feature;
            if(feature.popup) {
                map.removePopup(feature.popup);
                feature.popup.destroy();
                delete feature.popup;
            }
        }

	function poi(id, size,link, item, lat, long) {

		var fpoint = new OpenLayers.Geometry.Point(long, lat).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));

		var attributes = {
			'name' : item,
			'size' : size,
			'link' : link,
			'longitude' : long,
			'latitude' : lat
		};

		var feature = new OpenLayers.Feature.Vector(fpoint, attributes);
		feature.id = "POI_" + id;
		return feature;
	};