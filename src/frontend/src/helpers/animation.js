const ellipsisAnimation = `
		.loading:after {
			overflow: hidden;
			display: flex;
			-webkit-animation: ellipsis steps(4,end) 900ms infinite;      
			animation: ellipsis steps(4,end) 1500ms infinite;
			content: "\\2026";
			width: 0px;
		}
		
		@keyframes ellipsis { to { width: 1.25em; } }
		@-webkit-keyframes ellipsis { to { width: 1.25em; } }
	
	`

export { ellipsisAnimation }
