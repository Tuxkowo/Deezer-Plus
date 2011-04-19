var playerAPI = {
	artists: {},
	tracks: {},
	currentTrack: 0,
	currentArtist: 0,
	currentAlbum: 0,
	
	init: function(source) {
		
	},
	getTotalTracks: function(album) {
		var total = 0;
		for (var i in album.tracks) {
			total++;
		}
		return total;
	},
	getTotalLength: function(album) {
		var total = 0;
		for (var i in album.tracks) {
			total += parseInt(album.tracks[i].duration);
		}
		return total;
	},
	presentArtist: function(idArtist,source) {
		chrome.extension.sendRequest({name: "getInfos", resource:"playerapi-plus", details: {method:"artist", artistid: idArtist}}, function(artist) {
			playerAPI.renderArtistDiscography(artist,document.getElementById('disco-foreign'),source);
			
			document.getElementById('disco-focus').style.display = 'none';
			document.getElementById('disco-foreign').style.display = 'block';
			document.getElementById('disco').style.display = 'none';
			document.getElementById('related').style.display = 'none';
				
		});
	},
	presentAlbum: function(idArtist,idAlbum, source) {
		chrome.extension.sendRequest({name: "getInfos", resource:"playerapi-plus", details: {method:"album", artistid: idArtist, albumid: idAlbum}}, function(album) {
			playerAPI.renderAlbumListing(album,document.getElementById('disco-focus'),source,idArtist);
			
			document.getElementById('disco-focus').style.display = 'block';
			document.getElementById('disco-foreign').style.display = 'none';
			document.getElementById('disco').style.display = 'none';
			document.getElementById('related').style.display = 'none';
				
		});
	},
	renderQueue: function(queue, pos) {
		var ctns = new String;
		
		for (var i in queue) {
			ctns += "<li " + ((i == pos)?"class='currentTrack'":"") + "><span onclick='popup.playerControl(\"playQueue\",{index: " + i + "})'>" + queue[i].song + " - " + queue[i].artist + "</span><span class='duration' " + ((i == pos)?"":"onclick='popup.playerControl(\"deleteQueueItem\",{index: " + i + "})'") + ">" + displayLength(queue[i].duration) + "</span></li>";
		}
				
		document.getElementById('queuecontents').innerHTML = ctns;

	},
	renderAlbumListing: function(album, domElement, source, backToDisco) {
		var ctns = new String;
		ctns += "<img src='" + album.img + "' alt='Pochette de " + album.name + "' class='albumCover'/><div class='albumMeta'>";
		
		
		if(typeof source != "undefined") {
			switch(source) {
				case "artist":
					ctns += "<div class='backbutton' onclick='playerAPI.presentArtist(" + backToDisco + ")'>Retour</div>";
				break;
				case "artist-related":
					ctns += "<div class='backbutton' onclick='playerAPI.presentArtist(" + backToDisco + ",\"related\")'>Retour</div>";
				break;
				case "artist-search":
					ctns += "<div class='backbutton' onclick='playerAPI.presentArtist(" + backToDisco + ",\"search\")'>Retour</div>";
				break;
				case "search":
					ctns += "<div class='backbutton' onclick='popup.switchSecondView(\"site\",\"search\")'>Retour</div>";
				break;
			}
		}
		
		ctns += "<div class='artist'>" + album.artistName + "</div><div class='album'>" + album.name + "</div></div><ol>";
		
		var j = 0;
		for (var i in album.tracks) {
			ctns += "<li " + ((i == playerAPI.currentTrack)?"class='currentTrack'":"") + " onclick='popup.playerControl(\"playAlbum\",{album: " + album.id + ", index: " + j +  "})'>" + album.tracks[i].name + " <span class='duration'>" + displayLength(album.tracks[i].duration) + "</span></li>";
			j++;
		}

		ctns += "</div></ol>";
		
		domElement.innerHTML = ctns;
	},
	renderArtistDiscography: function(artist, domElement, backToArtist) {
		var ctns = new String;
		var returnto = undefined;
		if(typeof backToArtist != "undefined")
			switch(backToArtist) {
				case "related":
					ctns += "<div class='backcont'><div class='backbutton' onClick=\"popup.switchSecondView('artist_infos','related')\">Retour</div></div>";
					returnto = "artist-related";
				break;
				case "search":
					ctns += "<div class='backcont'><div class='backbutton' onClick=\"popup.switchSecondView('site','search')\">Retour</div></div>";
					returnto = "artist-search";
				break;
			}
		else
			returnto = "artist";
		ctns += "<ul>";
		
		for (var i in artist.albums) {
			ctns += "<li onclick='playerAPI.presentAlbum("+artist.id+","+ i +",\""+returnto+"\");'>";
				ctns += "<img src='" + artist.albums[i].img + "' alt='Pochette de " + artist.albums[i].name + "' >";
				ctns += "<div>" + artist.albums[i].name + "</div>";
				ctns += "<div><b>" + playerAPI.getTotalTracks(artist.albums[i]) + "</b> pistes </div>";
				ctns += "<div> Durée : <b>" + displayLength(playerAPI.getTotalLength(artist.albums[i])) + "</b> </div>";
			ctns += "</li>";
		}
		
		ctns += "</ul>";
		
		domElement.innerHTML = ctns;
	},
	renderRelatedArtists: function(artists,domElement) {
		var ctns = "<ul>";
		
		for (var i in artists) {
			ctns += "<li onclick='playerAPI.presentArtist(" + artists[i].id + ",\"related\");'>";
				ctns += "<img src='" + artists[i].img + "' alt='Image de " + artists[i].name + "' >";
				ctns += "<span>"+ artists[i].name + "</span>";
			ctns += "</li>";
		}
		
		ctns += "</ul>";
		domElement.innerHTML = ctns;
		
	},
	refreshPopUp: function() {
		chrome.extension.sendRequest({name: "getInfos", resource:"playerapi"}, function(response) {
			if(playerAPI.currentTrack != response.currentSongId || playerAPI.currentQueueId != response.currentQueueId || playerAPI.currentQueuePosition != response.currentQueuePosition) {
				playerAPI.currentQueue = response.currentQueue;
				playerAPI.currentQueuePosition = response.currentQueuePosition;
				playerAPI.currentQueueId = response.currentQueueId;
				
				playerAPI.renderQueue(playerAPI.currentQueue,playerAPI.currentQueuePosition);
			}
			
			if(playerAPI.currentTrack != response.currentSongId) {
				playerAPI.currentTrack = response.currentSongId;
				playerAPI.currentArtist = response.currentArtistId;
				playerAPI.currentAlbum = response.currentAlbumId;
				
				playerAPI.renderAlbumListing(response.artist.albums[response.currentAlbumId],document.getElementById('albumcontents'));
				playerAPI.renderArtistDiscography(response.artist,document.getElementById('disco'));
				playerAPI.renderRelatedArtists(response.related,document.getElementById('related'));
				
			}
			
			
		});
	},
	unload: function() {
		playerAPI.artists = {};
		playerAPI.tracks = {};
		playerAPI.currentTrack = 0;
	}
}