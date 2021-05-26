$(function () {
    var playerTrack = $("#player-track"),
        bgArtwork = $('#bg-artwork'),
        bgArtworkUrl, albumName = $('#album-name'),
        trackName = $('#track-name'),
        albumArt = $('#album-art'),
        sArea = $('#s-area'),
        seekBar = $('#seek-bar'),
        trackTime = $('#track-time'),
        insTime = $('#ins-time'),
        sHover = $('#s-hover'),
        playPauseButton = $("#play-pause-button"),
        i = playPauseButton.find('i'),
        tProgress = $('#current-time'),
        tTime = $('#track-length'),
        seekT, seekLoc, seekBarPos, cM, ctMinutes, ctSeconds, curMinutes, curSeconds, durMinutes, durSeconds, playProgress, bTime, nTime = 0,
        buffInterval = null,
        clearautoplay = null,
        tFlag = false,
        albums = [
            'A Little Love',
            'Beautiful In White',
            'A Thousand Year',
            'Take Me To Your Heart',
            'My Heart Will Go On',
            'Until You',
            'My Love',
            'The Nights',
            'Waiting For Love',
            'I Really Like You',
            'Tie Me Down',
            'Believer',
            'Love YourSelf',
            'Unstoppable',
            'I Love You 3000'
        ],
        trackNames = [
            'Fiona Fung',
            'Shane Filan',
            'Chiristina Perri',
            'Michael',
            'Celine Dion',
            'Shayne Ward',
            'Westlife',
            'Avicii',
            'Avicii',
            'Carly Rae Jepsen',
            'Gryffin ft Elley Duhé',
            'Imagine Dragon',
            'Justin Bieber',
            'Sia',
            'Stephanie Poetri'
        ],
        albumArtworks = [
            '_1', '_2', '_3', '_4', '_5',
            '_6', '_7', '_8', '_9', '_10',
            '_11', '_12', '_13', '_14', '_15'
        ],
        trackUrl = [
            'music/Fiona Fung - A little love.mp3',
            'music/Shane Filan - Beautiful In White.mp3',
            'music/Christina Perri - A Thousand Years.mp3',
            'music/Michael - Take Me To Your Heart.mp3',
            'music/Celine Dion - My Heart Will Go On.mp3',
            'music/Shayne Ward  - Until You.mp3',
            'music/Westlife - My Love.mp3',
            'music/Avicii - The Nights.mp3',
            'music/Avicii - Waiting For Love.mp3',
            'music/Carly Rae Jepsen - I Really Like You.mp3',
            'music/Gryffin ft Elley Duhé - Tie Me Down.mp3',
            'music/Imagine Dragons - Believer.mp3',
            'music/Justin Bieber - Love Yourself.mp3',
            'music/Sia - Unstoppable.mp3',
            'music/Stephanie Poetri - I Love You 3000.mp3'
        ],
        playPreviousTrackButton = $('#play-previous'),
        playNextTrackButton = $('#play-next'),
        currIndex = -1;

    // play pause
    function playPause() {
        setTimeout(function () {
            if (audio.paused) {
                playerTrack.addClass('active');
                albumArt.addClass('active');
                checkBuffering();
                i.attr('class', 'fas fa-pause');
                audio.play();

            } else {
                playerTrack.removeClass('active');
                albumArt.removeClass('active');
                clearInterval(buffInterval);
                albumArt.removeClass('buffering');
                i.attr('class', 'fas fa-play');
                audio.pause();
                clearInterval(clearautoplay);
            }
        }, 300);
    }


    // show hover
    function showHover(event) {
        seekBarPos = sArea.offset();
        seekT = event.clientX - seekBarPos.left;
        seekLoc = audio.duration * (seekT / sArea.outerWidth());

        sHover.width(seekT);

        cM = seekLoc / 60;

        ctMinutes = Math.floor(cM);
        ctSeconds = Math.floor(seekLoc - ctMinutes * 60);

        if ((ctMinutes < 0) || (ctSeconds < 0))
            return;

        if ((ctMinutes < 0) || (ctSeconds < 0))
            return;

        if (ctMinutes < 10)
            ctMinutes = '0' + ctMinutes;
        if (ctSeconds < 10)
            ctSeconds = '0' + ctSeconds;

        if (isNaN(ctMinutes) || isNaN(ctSeconds))
            insTime.text('--:--');
        else
            insTime.text(ctMinutes + ':' + ctSeconds);

        insTime.css({
            'left': seekT,
            'margin-left': '-21px'
        }).fadeIn(0);

    }

    // hide hover
    function hideHover() {
        sHover.width(0);
        insTime.text('00:00').css({
            'left': '0px',
            'margin-left': '0px'
        }).fadeOut(0);
    }

    // play from clicked position
    function playFromClickedPos() {
        audio.currentTime = seekLoc;
        seekBar.width(seekT);
        hideHover();
    }

    // update current time
    function updateCurrTime() {
        nTime = new Date();
        nTime = nTime.getTime();

        if (!tFlag) {
            tFlag = true;
            trackTime.addClass('active');
        }

        curMinutes = Math.floor(audio.currentTime / 60);
        curSeconds = Math.floor(audio.currentTime - curMinutes * 60);

        durMinutes = Math.floor(audio.duration / 60);
        durSeconds = Math.floor(audio.duration - durMinutes * 60);

        playProgress = (audio.currentTime / audio.duration) * 100;

        if (curMinutes < 10)
            curMinutes = '0' + curMinutes;
        if (curSeconds < 10)
            curSeconds = '0' + curSeconds;

        if (durMinutes < 10)
            durMinutes = '0' + durMinutes;
        if (durSeconds < 10)
            durSeconds = '0' + durSeconds;

        if (isNaN(curMinutes) || isNaN(curSeconds))
            tProgress.text('00:00');
        else
            tProgress.text(curMinutes + ':' + curSeconds);

        if (isNaN(durMinutes) || isNaN(durSeconds))
            tTime.text('00:00');
        else
            tTime.text(durMinutes + ':' + durSeconds);

        if (isNaN(curMinutes) || isNaN(curSeconds) || isNaN(durMinutes) || isNaN(durSeconds))
            trackTime.removeClass('active');
        else
            trackTime.addClass('active');


        seekBar.width(playProgress + '%');

        if (playProgress == 100) {
            noplaytrack()
            selectTrack(1)
        }
    }

    // no play track
    function noplaytrack() {
        i.attr('class', 'fa fa-play');
        seekBar.width(0);
        tProgress.text('00:00');
        albumArt.removeClass('buffering').removeClass('active');
        clearInterval(buffInterval);
    }

    // check buffering
    function checkBuffering() {
        clearInterval(buffInterval);
        buffInterval = setInterval(function () {
            if ((nTime == 0) || (bTime - nTime) > 1000)
                albumArt.addClass('buffering');
            else
                albumArt.removeClass('buffering');

            bTime = new Date();
            bTime = bTime.getTime();

        }, 100);
    }

    // select track
    function selectTrack(flag) {
        if (flag == 0 || flag == 1)
            ++currIndex;
        else
            --currIndex;

        if ((currIndex > -1) && (currIndex < albumArtworks.length)) {
            if (flag == 0)
                i.attr('class', 'fa fa-play');
            else {
                albumArt.removeClass('buffering');
                i.attr('class', 'fa fa-pause');
            }

            seekBar.width(0);
            trackTime.removeClass('active');
            tProgress.text('00:00');
            tTime.text('00:00');

            currAlbum = albums[currIndex];
            currTrackName = trackNames[currIndex];
            currArtwork = albumArtworks[currIndex];

            audio.src = trackUrl[currIndex];

            nTime = 0;
            bTime = new Date();
            bTime = bTime.getTime();

            if (flag != 0) {
                audio.play();
                playerTrack.addClass('active');
                albumArt.addClass('active');

                clearInterval(buffInterval);
                checkBuffering();
            }

            albumName.text(currAlbum);
            trackName.text(currTrackName);
            albumArt.find('img.active').removeClass('active');
            $('#' + currArtwork).addClass('active');

            bgArtworkUrl = $('#' + currArtwork).attr('src');

            bgArtwork.css({
                'background-image': 'url(' + bgArtworkUrl + ')'
            });
        } else {
            if (flag == 0 || flag == 1)
                --currIndex;
            else
                ++currIndex;
        }
    }

    // auto play track
    function autoplaytrack() {
        clearautoplay = setInterval(function () {
            playerTrack.addClass('active');
            albumArt.addClass('active');
            checkBuffering();
            i.attr('class', 'fas fa-pause');
            audio.play();
        }, 6000);
    }

    // init player
    function initPlayer() {
        if (window.innerWidth >= 768) {
            var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|zmp3/i.test(navigator.userAgent);

            audio = new Audio();
            if (isMobile == false) {
                autoplaytrack();
            }
            selectTrack(0);

            audio.loop = false;

            playPauseButton.on('click', playPause);

            sArea.mousemove(function (event) {
                showHover(event);
            });

            sArea.mouseout(hideHover);

            sArea.on('click', playFromClickedPos);

            $(audio).on('timeupdate', updateCurrTime);

            playPreviousTrackButton.on('click', function () {
                selectTrack(-1);
            });
            playNextTrackButton.on('click', function () {
                selectTrack(1);
            });
        }
    }
    initPlayer();
});