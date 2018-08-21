var viewer;
var avp = Autodesk.Viewing.Private;

function initializeViewer() {
    var options = {
        env: "Local",
        useADP: false,
        config3d: {
            extensions: ['Autodesk.Viewing.PixelCompare']
        },
        urn1: "2DCompare/sheet1/bubble.json",
        urn2: "2DCompare/sheet2/bubble.json",
    }

    options.config3d.compareSplitLineStyle = {
        width: 4,
        color: '#FF9054'
    };

    viewer = new avp.GuiViewer3D(document.getElementById('forgeViewer'), options.config3d);

    Autodesk.Viewing.Initializer(options, function() {
        viewer.start();
        Autodesk.Viewing.Document.load(options.urn1,
            function(document, errorsandwarnings) {
                var geometryItems = Autodesk.Viewing.Document.getSubItemsWithProperties(document.getRootItem(), {
                    'type': 'geometry',
                    'role': '2d'
                }, true);

                if (geometryItems.length > 0) {
                    var loadOptions = {};
                    var path = document.getViewablePath(geometryItems[0], loadOptions);
                    viewer.load(path, null, onLoadSuccess, null, document.acmSessionId, loadOptions);
                }

            }
        )
    });

    function onPixelCompareExtensionLoaded(pixelCompareExt) {
		var offsetMode = false;

        function onKeyDown(event) {
        	if (!event.keyCode) return;
        	if ((event.keyCode < 49) || (event.keyCode > 54)) return;

            if (event.keyCode == 49) {
                offsetMode = !offsetMode;
                pixelCompareExt.setChangeOffsetMode( offsetMode );
            } else
	            pixelCompareExt.setDiffMode(event.keyCode - 49);
        };
        window.addEventListener('keydown', onKeyDown);

        pixelCompareExt.compareModelWithCurrent(options.urn2).then(function(result) {
            console.log(`compare models ${result?"successful, yeah":"failed, boo"}`);
        });
    }

    function onLoadSuccess() {
        viewer.loadExtension('Autodesk.Viewing.PixelCompare').then(onPixelCompareExtensionLoaded);
    }
}