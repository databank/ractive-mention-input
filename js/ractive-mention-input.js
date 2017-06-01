

var RactiveMentionInput = Ractive.extend({
	isolated: true,
	template:
		'<div class="dbk-mention-input {{class}}" style="{{style_processed}};{{style_parsed}}">' +
		'	<input name="{{name}}" value="{{value}}" style="display: none;">'+
		'	<div style="position: absolute;top: 0px;left:0px;right: 0px;bottom: 0px;overflow: hidden;line-height: {{style_obj.height}};" contenteditable="true" value="{{html_value}}" on-keydown="keydown" on-blur="blur" on-focus="focus"></div>' +
		'	{{#if mentioning}}' +
		'	<div class="mentionables" style="position: absolute;top: {{mentioning.top}}px;left: {{mentioning.left}}px;right: {{mentioning.right}}px;">' +
		'		{{#mentionable}}' +
		"			<div class='mentionable' on-mousedown='@this.mention(event, this )'>" +
		'			{{.title}}' +
		'		</div>' +
		'		{{/mentionable}}' +
		'	</div>' +
		'	{{/if}}' +
		'</div>',
	process_html: function(input) {
		input = input.replace(/<br\s*\/?>/gi,' ').replace(/&nbsp;/g, ' ')
		input = input.replace(/<span class="mention" contenteditable="false">@([a-z]+)<\/span>/ig, "@user($1)")

		return input
	},
	unprocess_html: function(input) {
		input = input.replace(/@user\(([^\)]+)\)/gi, '<span class="mention" contenteditable="false">@$1</span>&nbsp;')
		return input
	},
	mention_wrap: function( id ) {
		return '<span class="mention" contenteditable="false">@' + id + '</span>&nbsp;'
	},
	//getPosition: function() {
	//	if (window.getSelection) {
	//		sel = window.getSelection();
	//		if (sel.getRangeAt) {
	//			return sel.getRangeAt(0).startOffset;
	//		}
	//	}
	//	return null;
	//},

	mention: function(e, choice ) {
		e.original.preventDefault() // prevent getting focus and contenteditable loosing it
		this.set('mentioning',null)
		//var ce = this.find('[contenteditable]'); ce.focus();window.getSelection().setPosition(ce, 0, 2);window.getSelection().getRangeAt(0).startContainer)
		document.execCommand('insertHTML',false,  this.mention_wrap( choice.id ) )
	},

	onrender: function () {
		this.on('mention-mousedown', function( e) {
			console.log('on mention', arguments )
			e.original.preventDefault();
			//var ce = this.find('[contenteditable]')
			//ce.focus()
			//return false
		})
		//this.on('blur', function(e) {console.log(this.getPosition())})
		//this.on('focus', function(e) {console.log("on focus")})
		this.on('keydown', function(event) {
			if (this.get('mentioning') !== null ) {
				if (event.original.which == 27)
					this.set('mentioning', null)

				if (event.original.which == 50) {
					this.set('mentioning', null)
					document.execCommand('insertHTML',false, '@' )
				}

				return false
			}

			if (event.original.which == 13)
				return false

			if (event.original.which === 50) {
				this.set('mentioning', {
					top: event.node.offsetHeight,
					left: 0,
					right: 0,
				})
				return false
			}

		})

		this.observe('style', function(style_string) {
			var $style = {
				position: 'relative',
				height: '19px',
				display: 'inline-block',
				'white-space': 'no-wrap',
				'background-color': '#fff',
				'box-sizing': 'border-box',
				'min-width': '131px',
			}

			var style_parsed = style_string.split(';').filter(function(m) {
				var kv = m.split(':').map(function(v) { return v.trim().toLowerCase() })
				if (kv.length > 2)
					return true

				if (['position','overflow','height','min-width','line-height', 'box-sizing','display','background-color'].indexOf(kv[0]) !== -1) {
					$style[kv[0]] = kv[1]
					return false
				}

				return true
			}).join(';')

			this.set('style_parsed', style_parsed )
			this.set('style_processed', Object.keys($style).map(function(s) { return s + ':' + $style[s]  }).join(';')  )
			this.set('style_obj', $style)

		})

		this.set('html_value', this.unprocess_html(this.get('value')) )

		this.observe('html_value', function( html_value ) {
			console.log("set back to value", arguments )
			this.set('value', this.process_html( html_value) )
		})
		this.observe('value', function(value) {
			this.set('html_value', this.unprocess_html(this.get('value')) )
		})

	},
	data: {
		mentioning: null,
	},
})
Ractive.components.mentioninput = RactiveMentionInput
