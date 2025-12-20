(async function () {

    const audioHost1 = 'audio-ssl';
    const audioHost2 = 'itunes';
    const audioHost3 = 'apple.com';

    const audioById = [
        "126/v4/e4/9f/ba/e49fba54-2ccb-ed76-bafa-9ba3d7fc47dc/mzaf_13124523745371417047.plus.aac.ep.m4a",
        "221/v4/75/9f/be/759fbe6b-b28e-0164-a5a0-9cfb42604492/mzaf_3822277519822038556.plus.aac.p.m4a",
        "116/v4/6b/b9/cd/6bb9cd4d-7bf6-2cba-0c9b-2322087b8f6f/mzaf_3654700793071442660.plus.aac.ep.m4a",
        "221/v4/91/dd/54/91dd54a1-22a4-5e8b-ea30-25ecad8f6227/mzaf_1754360905466369426.plus.aac.p.m4a",
        ["116/v4/fc/57/24/fc572468-b31a-ab0c-766b-d46a06f82a01/mzaf_14992437534491741088.plus.aac.ep.m4a", 25],
        "211/v4/da/fd/3f/dafd3fc0-2f18-4414-bd6a-ad103625ae0a/mzaf_12609211351409166864.plus.aac.ep.m4a",
        "112/v4/5c/4b/2a/5c4b2a85-e269-7a70-b5ec-80fb17bd535c/mzaf_636485444006707258.plus.aac.ep.m4a",
        "116/v4/f2/e3/9f/f2e39f0a-e9e2-0086-a956-c79cf2a727f1/mzaf_1630735791567978800.plus.aac.ep.m4a",
        "112/v4/69/f2/ed/69f2ed17-e029-c6ba-e449-54d867a9c9c0/mzaf_16126102044477419065.plus.aac.p.m4a",
        "126/v4/60/92/39/609239fd-e1b3-b31a-d527-95adb63aa337/mzaf_13653864954600704631.plus.aac.ep.m4a"
    ];

    const enableButton = document.getElementById("enable");

    let audio = new Audio();
    audio.preload = "auto";
    audio.volume = 1;

    let audioUnlocked = false;
    let stopTimer = null;

    audio.addEventListener('ended', () => {
        stopAudioNow();
    });

    function getAudio(audioData) {
        return [`https://${audioHost1}.${audioHost2}.${audioHost3}/itunes-assets/AudioPreview${(typeof audioData === "string" ? audioData : audioData[0])}`, audioData[1] || 0];
    }

    async function unlockAudio() {
        enableButton.textContent = "Enabling audio...";
        try {
            audio.src = getAudio(audioById[0])[0];
            audio.currentTime = 0;
            await audio.play();
            audio.pause();
            audio.currentTime = 0;
            audioUnlocked = true;
            enableButton.textContent = "";
            const noteSpan = document.createElement("span");
            noteSpan.className = "music-note";
            noteSpan.textContent = "♪";
            enableButton.appendChild(noteSpan);
            const textNode = document.createTextNode(" Audio enabled");
            enableButton.appendChild(textNode);
            enableButton.classList.add('audio-enabled');
            enableButton.disabled = true;
        } catch (e) {
            console.error("Audio unlock failed", e);
        }
    }

    async function playTenSecondsForId(id) {
        if (!audioUnlocked || !vegaView || !audioById[id-1]) {
            return;
        }

        vegaView.signal("isMusicOn", 1);

        clearTimeout(stopTimer);
        audio.pause();
        const data = getAudio(audioById[id-1]);
        audio.src = data[0];
        audio.currentTime = data[1];

        try {
            await audio.play();

        } catch (e) {
            console.error("Play failed", e);
        }
    }

    function stopAudioNow() {
        clearTimeout(stopTimer);
        vegaView?.signal("isMusicOn", 0);
        audio.pause();
        audio.currentTime = 0;
    }

    document.getElementById("enable").addEventListener("click", unlockAudio);

    const spec = await (await fetch("spec.json")).json();

    let vegaView = null;

    vegaEmbed("#vis", spec, {
        config: {
            "autosize": {
                "contains": "padding",
                "type": "fit"
            },
            "text": {
                "font": "Segoe Print, sans-serif"
            }
        },
        actions: false
    }).then(({ view }) => {

        vegaView = view;
        vegaView.addSignalListener("hoverEvent", (name, value) => {
            if (value == null) {
                stopAudioNow();
            } else {
                playTenSecondsForId(value);
            }
        });
    });

    

})();