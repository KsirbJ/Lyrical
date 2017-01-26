
// Interact.js code to respond to drag / resize

function dragMoveListener (event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // update the position attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

interact('.resize-drag')
	.draggable({
		restrict: {
			restriction: "document"
		},
		onmove: dragMoveListener
	})
	.resizable({
		preserveAspectRatio: false,
		edges: { left: true, right: true, bottom: true, top: true }
	})
	.on('resizemove', function (event) {
		var target = event.target,
	    x = (parseFloat(target.getAttribute('data-x')) || 0),
	    y = (parseFloat(target.getAttribute('data-y')) || 0);

		// update the element's style
		target.style.width  = event.rect.width + 'px';
		target.style.height = event.rect.height + 'px';

		// translate when resizing from top or left edges
		x += event.deltaRect.left;
		y += event.deltaRect.top;

		target.style.webkitTransform = target.style.transform =
	   		'translate(' + x + 'px,' + y + 'px)';

		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
	});