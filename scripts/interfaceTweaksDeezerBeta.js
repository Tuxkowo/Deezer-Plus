var interfaceTweaks = {	blockTopBar: false,	blockFooter: false,	expandPlayer: false,	singlePlayer: false,	init: function(source) {		if(source != 'page') {			interfaceTweaks.blockTopBar = (localStorage.getItem('interfacesBlockTopBar') == 'true')?true:false;			interfaceTweaks.blockFooter = (localStorage.getItem('interfacesBlockFooter') == 'true')?true:false;			interfaceTweaks.expandPlayer = (localStorage.getItem('interfacesExpandPlayer') == 'true')?true:false;			interfaceTweaks.singlePlayer = (localStorage.getItem('interfacesSinglePlayer') == 'true')?true:false;			if(source == 'options') {					document.getElementById("activateInterfacesBlockTopBar").checked = interfaceTweaks.blockTopBar;				document.getElementById("activateInterfacesBlockFooter").checked = interfaceTweaks.blockFooter;				document.getElementById("activateInterfacesExpendPlayer").checked = interfaceTweaks.expandPlayer;				document.getElementById("activateInterfacesSinglePlayer").checked = interfaceTweaks.singlePlayer;			}		}		else {			chrome.extension.sendRequest({name: "getInfos", resource:"interfaceTweaks"}, function(response) { 				interfaceTweaks.blockTopBar = response.blockTopBar;				interfaceTweaks.blockFooter = response.blockFooter;				interfaceTweaks.expandPlayer = response.expandPlayer;				interfaceTweaks.singlePlayer = response.singlePlayer;				interfaceTweaks.cleanInterface();							});		}	},	toggleStatus: function() {		localStorage.setItem("interfacesBlockTopBar", document.getElementById("activateInterfacesBlockTopBar").checked);		localStorage.setItem("interfacesBlockFooter", document.getElementById("activateInterfacesBlockFooter").checked);		localStorage.setItem("interfacesExpandPlayer", document.getElementById("activateInterfacesExpendPlayer").checked);		localStorage.setItem("interfacesSinglePlayer", document.getElementById("activateInterfacesSinglePlayer").checked);	},	cleanInterface: function() {		if(interfaceTweaks.blockTopBar) {		// Suppression de la barre supérieure, création de boutons supplémentaires			var nodes = document.getElementById('header').getElementsByTagName('div');			for(var i = 0; i < nodes.length ; i++) {				if(nodes[i].getAttribute('class') == "bgheader bgrepeat") {					nodes[i].style.display = 'none';				}			}						// Réduction de la taille de la barre de recherche de 40px			style = document.createElement("style");			style.innerHTML = 				  ".tips_beta { display:none; }"				+ "#dz_player .dzsearch { float: right; width: 265px; } "				+ "#div_home_search { width: 265px; } "				+ "#div_home_search .el_middle { width: 209px; } "				+ "#div_home_search .el_middle input { width: 209px; } ";				/*+ ".customToolbarButton div { width: 23px; height: 23px; background-position: -131px -128px; margin: 1px; } "				+ ".customToolbarButton div a {display: block; width: 17px; height: 15px; margin: 2px 0 0 -3px; padding-top: 6px 0 0 9px; background-position: center center; background-repeat: no-repeat;} "*/			homebutton = document.createElement('th');			homebutton.innerHTML = '<th scope="col" class="customToolbarButton">'				+ '<div class="option_bt_player main" original-title style="width: 23px; height: 23px; background-position: -131px -128px;">'					+ '<a href="#index.php" style="background-image:url(' + chrome.extension.getURL('res/page/home.png') + ');display: block; width: 17px; height: 15px; margin: 1px 0 0 -3px; padding: 6px 0 0 9px; background-position: center center; background-repeat: no-repeat;">&nbsp;</a>'				+ '</div>'			+ '</th>';			musicbutton = document.createElement('th');			musicbutton.innerHTML = '<th scope="col" class="customToolbarButton">'				+ '<div class="option_bt_player main" original-title style="width: 23px; height: 23px; background-position: -131px -128px;">'					+ '<a href="#music/home" style="background-image: url(' + chrome.extension.getURL('res/page/music.png') + ');display: block; width: 17px; height: 15px; margin: 1px 0 0 -3px; padding: 6px 0 0 9px; background-position: center center; background-repeat: no-repeat;">&nbsp;</a>'				+ '</div>'			+ '</th>';						// add désigne le bouton de la fonction ajouter à la PL sur la barre d'outils			document.getElementById('add').parentNode.parentNode.parentNode.insertBefore(homebutton,document.getElementById('add').parentNode.parentNode);			document.getElementById('fullscreen').parentNode.parentNode.parentNode.appendChild(musicbutton);			document.getElementById('playerPlus').appendChild(style);						//document.getElementById('home_search').value = "Recherche";			//location.href = "javascript:trad.suggest.search_default='Recherche';";		}		if(interfaceTweaks.blockFooter) {		// Suppression du Footer			document.getElementById('footer').style.display = 'none';		}		if(interfaceTweaks.expandPlayer) {			// Player à 100% de largeur			style = document.createElement("style");			style.innerHTML = 				  "#global { width: 100% !important; min-width:990px !important; } "				+ "#music { width: 100% !important; min-width:990px !important; } "				+ "#div_music embed {  width: 100% !important; min-width:990px !important; } ";				//+ "#normalPlayer > table {  width: 100% !important; min-width:990px !important; } ";			document.getElementById('playerPlus').appendChild(style);		}			},	killPlayer: function() {		chrome.windows.getAll({populate : true},function(windows) {			var openedtab = false;			for(var i = 0; i < windows.length; i++) {				var j = 0;				for(var tab in windows[i].tabs) {					if(typeof windows[i].tabs[j] != "undefined" && typeof windows[i].tabs[j].url != "undefined") {						if(RegExp("^http(s)?://(www\.)?deezer\.com","gi").test(windows[i].tabs[j].url)) {							if(!openedtab) {								openedtab = windows[i].tabs[j].id;							} else {								chrome.tabs.remove(windows[i].tabs[j].id);							}						}						j++;					}				}			}			chrome.tabs.update(openedtab, {				selected: true			});		});	}	}