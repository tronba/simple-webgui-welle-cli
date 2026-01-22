var channels = [ "5A", "5B", "5C", "5D", "6A", "6B", "6C", "6D", "7A", "7B",
"7C", "7D", "8A", "8B", "8C", "8D", "9A", "9B", "9C", "9D", "10A", "10B",
"10C", "10D", "11A", "11B", "11C", "11D", "12A", "12B", "12C", "12D", "13A",
"13B", "13C", "13D", "13E", "13F" ];

var currentServiceId = null;
var latestMuxData = null;
var channelRefreshTimer = null;
var muxRefreshTimer = null;

window.onload = function() {
    initChannelSelector();
    initPlayerControls();
    refreshChannel();
    fetchMuxData();
    channelRefreshTimer = setInterval(refreshChannel, 2000);
    muxRefreshTimer = setInterval(fetchMuxData, 1000);
};

function initChannelSelector() {
    var selector = document.getElementById("channelselector");
    if (!selector) {
        return;
    }
    selector.innerHTML = "";
    for (var i = 0; i < channels.length; i++) {
        var opt = document.createElement("option");
        opt.text = channels[i];
        selector.options.add(opt);
    }
    selector.onchange = function() {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/channel", true);
        xhr.setRequestHeader("Content-type", "text/plain");
        xhr.send(selector.value);
    };
}

function initPlayerControls() {
    var playToggle = document.getElementById("playToggle");
    var player = document.getElementById("player");
    if (!playToggle || !player) {
        return;
    }
    playToggle.onclick = function() {
        if (!currentServiceId) {
            return;
        }
        if (player.paused || !player.currentSrc) {
            playSelectedService();
        }
        else {
            stopPlayer();
        }
    };
    player.addEventListener("play", updatePlayButton);
    player.addEventListener("pause", updatePlayButton);
    player.addEventListener("ended", function() {
        stopPlayer();
    });
    updatePlayButton();
}

function fetchMuxData() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4 || xhr.status != 200) {
            return;
        }
        latestMuxData = JSON.parse(xhr.responseText);
        buildServiceList(latestMuxData.services);
        renderNowPlaying();
    };
    xhr.open("GET", "/mux.json", true);
    xhr.send();
}

function buildServiceList(services) {
    var list = document.getElementById("serviceList");
    if (!list) {
        return;
    }
    list.innerHTML = "";
    if (!services) {
        return;
    }

    var entries = [];
    for (var key in services) {
        if (!Object.prototype.hasOwnProperty.call(services, key)) {
            continue;
        }
        var service = services[key];
        var order = 864;
        if (service.components && service.components.length > 0) {
            var sub = service.components[0].subchannel;
            if (sub && sub.sad !== undefined) {
                order = sub.sad;
            }
        }
        entries.push({ order: order, service: service });
    }

    entries.sort(function(a, b) {
        return a.order - b.order;
    });

    for (var i = 0; i < entries.length; i++) {
        var svc = entries[i].service;
        var button = document.createElement("button");
        button.type = "button";
        button.className = "service-button";
        var labelText = "";
        if (svc.label) {
            labelText = svc.label.fig2label || svc.label.label || "";
        }
        button.textContent = labelText;
        button.dataset.sid = String(svc.sid);
        button.onclick = function(evt) {
            var sid = evt.currentTarget.dataset.sid;
            selectService(sid, true);
        };
        if (String(svc.sid) === String(currentServiceId)) {
            button.classList.add("active");
        }
        list.appendChild(button);
    }
}

function selectService(sid, autoPlay) {
    if (!sid) {
        return;
    }
    currentServiceId = String(sid);
    highlightActiveServiceButton();
    renderNowPlaying();
    if (autoPlay) {
        playSelectedService();
    }
    else {
        updatePlayButton();
    }
}

function playSelectedService() {
    if (!currentServiceId) {
        return;
    }
    var player = document.getElementById("player");
    player.src = "/mp3/" + currentServiceId;
    player.load();
    var promise = player.play();
    if (promise && promise.catch) {
        promise.catch(function() {
            updatePlayButton();
        });
    }
    highlightActiveServiceButton();
    updatePlayButton();
}

function stopPlayer() {
    var player = document.getElementById("player");
    player.pause();
    player.removeAttribute("src");
    player.load();
    updatePlayButton();
}

function updatePlayButton() {
    var playToggle = document.getElementById("playToggle");
    var player = document.getElementById("player");
    if (!playToggle || !player) {
        return;
    }
    if (!player.paused && player.currentSrc) {
        playToggle.textContent = "Stop";
    }
    else {
        playToggle.textContent = "Play";
    }
}

function highlightActiveServiceButton() {
    var list = document.getElementById("serviceList");
    if (!list) {
        return;
    }
    var buttons = list.getElementsByClassName("service-button");
    for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].dataset.sid === String(currentServiceId)) {
            buttons[i].classList.add("active");
        }
        else {
            buttons[i].classList.remove("active");
        }
    }
}

function renderNowPlaying() {
    var fig2El = document.getElementById("fig2label");
    var labelEl = document.getElementById("ensemblelabel");
    var dlsEl = document.getElementById("dlsText");
    var service = getServiceById(currentServiceId);
    if (service) {
        var fig2 = "";
        if (service.label) {
            fig2 = service.label.fig2label || service.label.label || "";
        }
        fig2El.textContent = fig2 || "Service";
        labelEl.textContent = (service.label && service.label.label) ? service.label.label : "";
        dlsEl.textContent = (service.dls && service.dls.label) ? service.dls.label : "";
        updateErrorPill(service);
    }
    else {
        fig2El.textContent = "Select a service";
        labelEl.textContent = "";
        dlsEl.textContent = "";
        updateErrorPill(null);
    }
    highlightActiveServiceButton();
}

function getServiceById(sid) {
    if (!sid || !latestMuxData || !latestMuxData.services) {
        return null;
    }
    for (var key in latestMuxData.services) {
        if (!Object.prototype.hasOwnProperty.call(latestMuxData.services, key)) {
            continue;
        }
        var service = latestMuxData.services[key];
        if (String(service.sid) === String(sid)) {
            return service;
        }
    }
    return null;
}

function updateErrorPill(service) {
    var pill = document.getElementById("errorPill");
    var frameEl = document.getElementById("frameErrors");
    var rsEl = document.getElementById("rsErrors");
    var aacEl = document.getElementById("aacErrors");
    if (!pill || !frameEl || !rsEl || !aacEl) {
        return;
    }
    if (service && service.errorcounters) {
        var frameValue = service.errorcounters.frameerrors || 0;
        var rsValue = service.errorcounters.rserrors || 0;
        var aacValue = service.errorcounters.aacerrors || 0;
        frameEl.textContent = "Frame " + frameValue;
        rsEl.textContent = "RS " + rsValue;
        aacEl.textContent = "AAC " + aacValue;
        if (frameValue > 0 || rsValue > 0 || aacValue > 0) {
            pill.classList.remove("ok");
        }
        else {
            pill.classList.add("ok");
        }
    }
    else {
        frameEl.textContent = "Frame -";
        rsEl.textContent = "RS -";
        aacEl.textContent = "AAC -";
        pill.classList.add("ok");
    }
}

function refreshChannel() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4 || xhr.status != 200) {
            return;
        }
        var selector = document.getElementById("channelselector");
        if (selector) {
            selector.value = xhr.responseText;
        }
    };
    xhr.open("GET", "/channel", true);
    xhr.send();
}
