(function() {

    "use strict";

    var av = Autodesk.Viewing;
    var avp = av.Private;
    var avep = AutodeskNamespace('Autodesk.Viewing.Extensions.PixelCompare');

    var PixelCompareTool = function(viewer, iterDiff) {
        av.ToolInterface.call(this);
        this.names = ['pixelCompare'];

        var _isActive = false;
        var _isSettingOffset = false;
        var _dragging = false;
        var _startDrag = null;
        var _curOffset = null;

        /**
         * Sets the offset changing mode
         * @param {boolean} enable
         */
        this.setOffsetSettingMode = function(enable) {
            _isSettingOffset = enable;
        };

        this.isActive = function() {
            return _isActive;
        };

        this.activate = function(name) {
            _isActive = true;
        };

        this.deactivate = function(name) {
            _isActive = false;
        };

        this.handleButtonDown = function(event, button) {
            if (!_isSettingOffset || button !== 0) return false;

            _curOffset = iterDiff.getOffset();
            _startDrag = clientToWorld(viewer, event.canvasX, event.canvasY);
            _dragging = true;

            return true;
        };

        this.handleButtonUp = function(event, button) {
            if (!_isSettingOffset || button !== 0) return false;

            _dragging = false;

            return true;
        };

        /**
         * Specialize base class implementation
         */
        this.handleMouseMove = function(event) {
            if (!_dragging) return false;

            var drag = clientToWorld(viewer, event.canvasX, event.canvasY);
            var newOffset = drag.sub(_startDrag).add(_curOffset);
            iterDiff.setOffset(newOffset);
            viewer.impl.invalidate(true, true);

            return true;
        };

        this.handleGesture = function(event) {
            switch(event.type)
            {
                case 'dragstart':
                    return this.handleButtonDown(event);

                case 'dragmove':
                    return this.handleMouseMove(event);

                case 'dragend':
                    return this.handleButtonUp(event);
            }
            return false;
        };

        this.getCursor = function() {
            return _isSettingOffset ? 'move' : null;
        };
    };

    var inputMap = {
        down: {
            pointer: 'pointerdown',
            mouse: 'mousedown',
            touch: 'touchstart'
        },
        up: {
            pointer: 'pointerup',
            mouse: 'mouseup',
            touch: 'touchend'
        },
        move: {
            pointer: 'pointermove',
            mouse: 'mousemove',
            touch: 'touchmove'
        }
    };

    function _getInputEvents(type) {
        if (av.isIE11)
            return [inputMap[type]['pointer']];

        var events = [];
        if (!av.isMobileDevice())
            events.push(inputMap[type]['mouse']);

        if (av.isTouchDevice())
            events.push(inputMap[type]['touch']);

        return events;
    }

    function getClientCoords(event) {
        if (av.isIE11)
            return { x: event.clientX, y: event.clientY };

        return event.type.startsWith('touch') ?
            { x: event.touches[0].clientX, y: event.touches[0].clientY } :
            { x: event.clientX, y: event.clientY };
    }

    function isTouchEvent(event) {
        if (av.isIE11)
            return event.pointerType === 'touch';

        return event.type.startsWith('touch');
    }

    function addRemoveInputEvents(elem, type, cb, isRemoving) {
        isRemoving = !!isRemoving;
        var action = (isRemoving ? 'remove' : 'add') + 'EventListener';
        var events = _getInputEvents(type);
        events.forEach(function(event) {
            elem[action](event, cb);
        });
    }

    function clientToWorld(viewer, x, y) {

        var worldPos = viewer.impl.clientToViewport(x, y);
        worldPos.unproject(viewer.impl.camera);

        return worldPos;
    }

    var Utils = {
        getClientCoords: getClientCoords,
        isTouchEvent: isTouchEvent,
        addRemoveInputEvents: addRemoveInputEvents,
        clientToWorld: clientToWorld
    };

    avep.PixelCompareTool = PixelCompareTool;
    avep.Utils = Utils;

})();
