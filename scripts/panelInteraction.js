let panelVisible = true
let panelCloseBtn = document.getElementById('js-close-panel-btn')

panelCloseBtn.addEventListener('click', function() {
	let panel = document.getElementById('js-panel')

	if (panelVisible) {
		panelCloseBtn.className = "close-panel-btn--closing"
		panel.className = "panel--closing"
	
		setTimeout(function() {
			panelCloseBtn.className = "close-panel-btn--closed"
			panel.className = "panel--closed"
			panelVisible = false
		}, 700)
	}
	else {
		panelCloseBtn.className = "close-panel-btn--opening"
		panel.className = "panel--opening"

		setTimeout(function() {
			panelCloseBtn.className = "close-panel-btn"
			panel.className = "panel"
			panelVisible = true
		}, 700)
	}
})