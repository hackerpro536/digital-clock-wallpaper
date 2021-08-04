window.onerror = function (a, b, c) {
    try {
        window.webkit.messageHandlers.callbackHandler.postMessage("JavaScript Error Message: " + a + " URL: " + b + " Line: " + c)
    } catch (e) {
        console.log(e.message)
    }
};

function isScreensaver() {
    return (navigator.userAgent.indexOf('Fliqlo') >= 0 && navigator.userAgent.indexOf('Screensaver') >= 0)
};

function isMobileApp() {
    return (navigator.userAgent.indexOf('Fliqlo') >= 0 && navigator.userAgent.indexOf('Screensaver') >= 0 && navigator.userAgent.indexOf('MobileApp') >= 0)
};

function isDev() {
    return true;
};

function debug(a) {
    if (!$('#debug').length) $('body').append('<div id="debug"></div>');
    $('#debug').html(a)
};

function setLocalStrage(n, v) {
    if (isDev()) localStorage.setItem(n, v)
};

function getLocalStrage(n) {
    return localStorage.getItem(n)
};
var isFlipTest = false,
    tf = 0,
    bg = true,
    bc = true,
    vs = Boolean(isDev() || isScreensaver()),
    hf = isMobileApp(),
    sc = 100,
    scMax = sc,
    scMin = 50,
    osp = 1,
    br = 100,
    brMax = br,
    brMin = (isMobileApp()) ? 25 : 50,
    dsptf = tf,
    maintimer = 0,
    dsphur, dspmin, init = false,
    ort = (360 + window.orientation) % 360;

function _orientationchange(t, p) {
    var a = (360 + t) % 360;
    if (a != ort) {
        $('#main-content').removeClass('ort-disabled');
        $('body').toggleClass('portrait', p).removeClass($(document.body).data('ort')).addClass('ort-' + ort + '-' + a).data('ort', 'ort-' + ort + '-' + a);
        ort = a
    }
};
$(window).on("orientationchange", function () {
    var o = window.orientation;
    _orientationchange(o, Boolean(o === 0 || o === 180))
});

function startSettings() {
    $('body').addClass('settings');
    $('#main-content-area').addClass('fade')
};

function updateSettings(a) {
    if (a.hasOwnProperty('reset') && a.reset) {
        $('body').removeClass('settings');
        $('#main-content').addClass('ort-disabled');
        $('#main-content-area').removeClass('fade')
    };
    if (a.hasOwnProperty('legacy') && a.legacy) {
        if (localStorage.getItem('tfh') !== null) {
            var b = Boolean(localStorage.getItem('tfh'));
            if (a.hasOwnProperty('tf') && b && a.tf != 2) {
                a.tf = 2;
                if (isScreensaver()) window.webkit.messageHandlers.updateVal.postMessage({
                    tf: a.tf
                })
            } else if (a.hasOwnProperty('tf') && !b && a.tf != 0) {
                a.tf = 0;
                if (isScreensaver()) window.webkit.messageHandlers.updateVal.postMessage({
                    tf: a.tf
                })
            }
            localStorage.removeItem('tfh')
        };
        if (localStorage.getItem("zoom") !== null) {
            var c = Number(localStorage.getItem('zoom'));
            c = Math.min(100, Math.max(50, c));
            if (a.hasOwnProperty('sc') && a.sc != c) {
                a.sc = c;
                if (isScreensaver()) webkit.messageHandlers.updateVal.postMessage({
                    sc: a.sc
                })
            }
            localStorage.removeItem('zoom')
        }
    };
    if (a.hasOwnProperty('tf')) {
        if (tf != a.tf) {
            var d = !Boolean(a.tf > 0 && tf > 0 && dsphur >= 10);
            tf = a.tf;
            setLocalStrage('tf', tf);
            if (d && a.hasOwnProperty('reset') && a.reset) {
                $(document.body).trigger('_updateTime', [true])
            } else if (d && tf != dsptf && !$(document.body).hasClass('hlock')) {
                $(document.body).trigger('_updateFlips', [true, false])
            } else if (!d) {
                dsptf = tf
            }
        }
    };
    if (a.hasOwnProperty('sc')) {
        $(document.body).trigger('_updateScale', [{
            value: a.sc,
            save: true
        }])
    };
    if (a.hasOwnProperty('sb') && bg != a.sb) {
        bg = a.sb;
        setLocalStrage('bg', bg);
        $('#main-content-area').toggleClass('dark', !bg)
    };
    if (a.hasOwnProperty('anm')) {
        $('#main-content-area').toggleClass('fade', a.anm)
    };
    if (a.hasOwnProperty('bc')) {
        if (bc != a.bc) {
            bc = a.bc;
            setLocalStrage('bc', bc)
        };
        if (a.hasOwnProperty('reset') && a.reset && br != 100) {
            br = 100;
            setLocalStrage('brightness', br)
        };
        $(document.body).trigger('_updateBrightness', [{
            value: (bc) ? br : brMax
        }])
    };
    if (a.hasOwnProperty('br')) {
        $(document.body).trigger('_updateBrightness', [{
            value: a.br,
            save: true
        }])
    };
    if (a.hasOwnProperty('vs')) {
        if (vs != a.vs) {
            vs = a.vs;
            setLocalStrage('vs', vs)
        };
        if (a.hasOwnProperty('reset') && a.reset && sc != scMax) {
            sc = scMax;
            setLocalStrage('scale', sc)
        };
        $(document.body).trigger('_updateScale', [{
            value: (vs) ? sc : scMax
        }])
    };
    if (a.hasOwnProperty('hf') && hf != a.hf) {
        hf = a.hf;
        setLocalStrage('hf', hf)
    }
};

function endSettings(a) {
    $('body').removeClass('settings');
    $('#main-content').addClass('ort-disabled');
    $('#main-content-area').removeClass('fade');
    if (a) {
        $(document.body).trigger('_updateTime', [true])
    }
};

function toggleBlurApp(b) {
    if (init) {
        clearTimeout(maintimer);
        if (!b) {
            $('#main-content').addClass('ort-disabled');
            maintimer = maintimer % 10000;
            maintimer = setTimeout(function () {
                $(document.body).trigger("_updateTime")
            }, 500)
        } else {
            if ($(document.body).hasClass('hlock') || $(document.body).hasClass('mlock')) {
                $('#main-content-area').addClass('stop');
                $('.flip').removeClass('transform fadein fadeout');
                $('#hur-top-clone, #min-top-clone, #hur-bottom-clone, #min-bottom-clone').trigger('animationend');
                $(document.body).removeClass('hlock mlock')
            }
        }
    }
};

function updateOSP(w, h) {
    $('body').toggleClass('portrait', h > w);
    var a = Math.max(w, h);
    var b = Math.min(w, h);
    osp = Math.min(b / Math.min($('#main-content').width(), $('#main-content').height()), a / Math.max($('#main-content').width(), $('#main-content').height()));
    $(document.body).trigger('_updateScale', [{
        value: sc
    }])
};
document.addEventListener('DOMContentLoaded', function () {
    if (isScreensaver() || isMobileApp() || isDev()) {
        $('html').addClass(((isScreensaver()) ? '' : 'no-') + 'screensaver').addClass(((isMobileApp()) ? '' : 'no-') + 'mobileapp');
        if (isDev()) {
            $('#main').before('<div id="prefs">' + '<input id="bg" type="checkbox" title="Background">' + '<select id="tf" title="Hour"><option value="0"' + ((tf == 0) ? ' selected' : '') + '>12h</option><option value="1"' + ((tf == 1) ? ' selected' : '') + '>24h</option><option value="2"' + ((tf == 2) ? ' selected' : '') + '>24h w/o 0</option></select>' + '<input id="scale" title="Scale" type="range" min="' + scMin + '" max="' + scMax + '" value="' + sc + '" step="1" style="width:' + (scMax - scMin) + 'px">' + '<input id="brightness" title="Brightness" type="range" min="' + brMin + '" max="' + brMax + '" value="' + br + '" step="1" style="width:' + (brMax - brMin) + 'px">' + '</div>');
            $(document.body).on('_setTimer', function () {
                clearTimeout($(this).data("timer"));
                (function (a) {
                    a.data('timer', setTimeout(function () {
                        if (!a.hasClass('pause')) a.removeClass('hover')
                    }, 5000))
                })($(this))
            });
            var j, oy;
            $('body').on('mousemove', function (e) {
                if (e.clientX != j || e.clientY != oy) {
                    $(this).addClass('hover').trigger('_setTimer');
                    j = e.clientX;
                    oy = e.clientY
                }
            }).on('mouseleave', function () {
                clearTimeout($(this).data('timer'));
                $(this).removeClass('hover')
            });
            $('.nav').hover(function () {
                $(document.body).addClass('pause')
            }, function () {
                $(document.body).removeClass('pause')
            });
            $('#tf').on('change', function () {
                updateSettings({
                    tf: Number($(this).val())
                })
            });
            $('#scale').on('input change', function () {
                $(document.body).trigger('_updateScale', [{
                    value: Number($(this).val())
                }])
            }).on('mouseup touchend', function () {
                $(document.body).trigger('_updateScale', [{
                    value: Number($(this).val()),
                    save: true
                }])
            });
            $('#brightness').on('input change', function () {
                br = Number($(this).val());
                $('#main-content-area').css({
                    'webkitFilter': 'brightness(' + br + '%)',
                    filter: 'brightness(' + br + '%)'
                })
            }).on('mouseup touchend', function () {
                setLocalStrage('brightness', $(this).val())
            });
            $('#bg').on('click', function () {
                updateSettings({
                    sb: $('#bg').is(':checked'),
                    anm: true
                })
            });
            if (localStorage.getItem('tf') === null) {
                setLocalStrage('tf', tf)
            } else {
                tf = Number(localStorage.getItem('tf'))
            };
            $('#tf').val(tf);
            if (localStorage.getItem('bg') === null) {
                setLocalStrage('bg', bg)
            } else {
                bg = Boolean(localStorage.getItem('bg') == 'true')
            };
            if (bg) $('#bg').prop('checked', true);
            $('#main-content-area').toggleClass('dark', !bg);
            if (localStorage.getItem('brightness') === null || isNaN(Number(localStorage.getItem('brightness')))) {
                setLocalStrage('brightness', br)
            } else {
                var k = Number(localStorage.getItem('brightness'));
                br = Math.max(brMin, Math.min(brMax, k));
                if (br != k) setLocalStrage('brightness', br)
            };
            $('#brightness').val((bc) ? br : brMax);
            $('#main-content-area').css({
                'webkitFilter': 'brightness(' + ((bc) ? br : brMax) + '%)',
                filter: 'brightness(' + ((bc) ? br : brMax) + '%)'
            });
            if (localStorage.getItem('scale') === null) {
                setLocalStrage('scale', sc)
            } else {
                var l = Number(localStorage.getItem('scale'));
                if (!isNaN(l)) sc = Math.max(Number($('#scale').attr('min')), Math.min(100, l));
                if (sc != l) {
                    setLocalStrage('scale', sc);
                    $('#scale').val((vs) ? sc : 100)
                }
            }
        };
        if (isMobileApp()) webkit.messageHandlers.updateVal.postMessage({
            bg: bg,
            tf: tf,
            bc: bc,
            vs: vs,
            hf: hf
        });
        var n = {
            lines: 12,
            length: 4,
            width: 2,
            radius: 6,
            corners: 1,
            rotate: 0,
            direction: 1,
            color: '#ccc',
            speed: 1,
            trail: 60,
            shadow: false,
            hwaccel: true,
        };
        var o = document.getElementById('loader');
        var p = new Spinner(n);
        var q = setTimeout(function () {
            p.spin(o)
        }, 1000);
        $('#loader').on('transitionend', function () {
            p.stop();
            $(this).remove();
            $(document.body).removeClass('init')
        });
        $(window).on('load', function () {
            clearTimeout(q);
            $(document.body).addClass('init')
        });
        $('.flip').each(function () {
            var a = $(this);
            a.clone().appendTo(a.parent('.flips')).addClass('clone')
        });
        $('.flip').each(function () {
            var a = $(this);
            var b = (a.hasClass('hur')) ? 'hur' : 'min';
            var c = (a.hasClass('top')) ? 'top' : 'bottom';
            var d = (a.hasClass('clone')) ? 'clone' : 'org';
            a.data('hm', b).attr('id', b + '-' + c + '-' + d)
        }).append('<span>');
        $(document.body).on('_updateScale', function (e, a) {
            if (a.hasOwnProperty('value') && !isNaN(a.value)) {
                var v = Math.min(scMax, Math.max(scMin, a.value));
                if ($('#scale').length && $('#scale').val() != v) $('#scale').val(v);
                if (a.hasOwnProperty('zoom') && a.zoom === true) $('#main').addClass('zoom');
                $('#main').css({
                    transform: 'scale(' + ((v / 100) * osp) + ')'
                });
                if (a.hasOwnProperty('save') && a.save === true && sc != v) {
                    sc = v;
                    setLocalStrage('scale', sc)
                }
            }
        }).on('_updateBrightness', function (e, a) {
            if (a.hasOwnProperty('value') && !isNaN(a.value)) {
                var v = Math.min(brMax, Math.max(brMin, a.value));
                if ($('#brightness').length && $('#brightness').val() != v) $('#brightness').val(v);
                $('#main-content-area').css({
                    'webkitFilter': 'brightness(' + v + '%)',
                    filter: 'brightness(' + v + '%)'
                });
                if (a.hasOwnProperty('save') && a.save === true && br != v) {
                    br = v;
                    setLocalStrage('brightness', br)
                }
            }
        });
        $(window).on('_resize orientationchange', function () {
            if (isMobileApp()) {
                webkit.messageHandlers.getScreenSize.postMessage("")
            } else {
                updateOSP($('body').width(), $('body').height())
            }
        }).on('resize', function () {
            $(window).trigger('_resize')
        }).trigger('_resize');
        $(document.body).on('_updateTime', function (a, b) {
            var c = new Date();
            var d = c.getHours();
            var e = (!isFlipTest) ? c.getMinutes() : c.getSeconds();
            var f = (d <= 12) ? 'am' : 'pm';
            e = (e < 10) ? '0' + e : e;
            if (b || dsphur == undefined || dspmin == undefined) {
                $('#main-content-area').addClass('stop');
                $('.flip').removeClass('transform fadein fadeout');
                $('.flip.hur').toggleClass('tf0', (tf == 0)).toggleClass('pm', (tf == 0 && d >= 12)).toggleClass('one', ((tf == 0 && d == 1) || (tf == 0 && d == 13) || (tf == 2 && d == 1))).toggleClass('eleven', (d == 11 || (tf == 0 && d == 23))).find('span').text((tf == 0 && (d == 0 || d >= 13)) ? Math.abs(d - 12) : ((tf == 1 && d < 10) ? ('0' + d) : d));
                $('.flip.min').toggleClass('eleven', (e == 11)).find('span').text(e);
                dsphur = d;
                dspmin = e;
                dsptf = tf;
                $(document.body).removeClass('hlock mlock')
            } else if ((d != dsphur) || (e != dspmin) || (tf != dsptf)) {
                var g = Boolean(e != dspmin && !$(document.body).hasClass('mlock'));
                if (g) dspmin = e;
                var h = Boolean(d != dsphur && !$(document.body).hasClass('hlock'));
                if (h) dsphur = d;
                var i = Boolean(tf != dsptf && !$(document.body).hasClass('hlock'));
                if (g || h || i) {
                    $(document.body).trigger('_updateFlips', [Boolean(h || i), g]);
                    if (isMobileApp()) webkit.messageHandlers.impactHapticFeedback.postMessage("")
                }
            };
            if (!b) {
                maintimer = maintimer % 10000;
                maintimer = setTimeout(arguments.callee, 250)
            }
        }).on('_updateFlips', function (e, h, m) {
            $('#main-content-area').removeClass('stop');
            if (h) {
                dsptf = tf;
                $('#hur-top-clone,#hur-bottom-clone').addClass('transform');
                $('#hur-top-org').toggleClass('tf0', (dsptf == 0)).toggleClass('pm', (dsptf == 0 && dsphur >= 12)).toggleClass('one', ((dsptf == 0 && dsphur == 1) || (dsptf == 0 && dsphur == 13) || (dsptf == 2 && dsphur == 1))).toggleClass('eleven', (dsphur == 11 || (dsptf == 0 && dsphur == 23))).addClass('fadein').find('span').text((dsptf == 0 && (dsphur == 0 || dsphur >= 13)) ? Math.abs(dsphur - 12) : ((dsptf == 1 && dsphur < 10) ? ('0' + dsphur) : dsphur));
                $('#hur-bottom-clone').toggleClass('tf0', (dsptf == 0)).toggleClass('pm', (dsptf == 0 && dsphur >= 12)).toggleClass('one', ((dsptf == 0 && dsphur == 1) || (dsptf == 0 && dsphur == 13) || (dsptf == 2 && dsphur == 1))).toggleClass('eleven', (dsphur == 11 || (dsptf == 0 && dsphur == 23))).find('span').text((dsptf == 0 && (dsphur == 0 || dsphur >= 13)) ? Math.abs(dsphur - 12) : ((dsptf == 1 && dsphur < 10) ? ('0' + dsphur) : dsphur));
                $('#hur-bottom-org').addClass('fadeout')
            };
            if (m) {
                $('#min-top-clone,#min-bottom-clone').addClass('transform');
                $('#min-top-org').toggleClass('eleven', (dspmin == 11)).addClass('fadein').find('span').text(dspmin);
                $('#min-bottom-clone').toggleClass('eleven', (dspmin == 11)).find('span').text(dspmin);
                $('#min-bottom-org').addClass('fadeout')
            }
        });
        $('#hur-top-clone,#min-top-clone').on('animationstart', function () {
            var a = $(this);
            var b = a.data('hm');
            if (b == 'hur') $(document.body).addClass('hlock');
            else if (b == 'min') $(document.body).addClass('mlock')
        }).on('animationend', function () {
            var a = $(this);
            var b = a.data('hm');
            a.removeClass('transform').find('span').text((b == 'hur') ? ((dsptf == 0 && (dsphur == 0 || dsphur >= 13)) ? Math.abs(dsphur - 12) : ((dsptf == 1 && dsphur < 10) ? ('0' + dsphur) : dsphur)) : dspmin);
            if (b == 'hur') a.toggleClass('tf0', (dsptf == 0)).toggleClass('pm', (dsptf == 0 && dsphur >= 12)).toggleClass('one', ((dsptf == 0 && dsphur == 1) || (dsptf == 0 && dsphur == 13) || (dsptf == 2 && dsphur == 1))).toggleClass('eleven', (dsphur == 11 || (dsptf == 0 && dsphur == 23)));
            else if (b == 'min') a.toggleClass('eleven', (dspmin == 11))
        });
        $('#hur-top-org,#min-top-org').on('animationend', function () {
            $(this).removeClass('fadein')
        });
        $('#hur-bottom-clone,#min-bottom-clone').on('animationend', function () {
            var a = $(this);
            var b = a.data('hm');
            a.removeClass('transform');
            $('#' + b + '-bottom-org').toggleClass('tf0', (b == 'hur' && dsptf == 0)).toggleClass('pm', (b == 'hur' && dsptf == 0 && dsphur >= 12)).toggleClass('one', (b == 'hur' && ((dsptf == 0 && dsphur == 1) || (dsptf == 0 && dsphur == 13) || (dsptf == 2 && dsphur == 1)))).toggleClass('eleven', ((b == 'hur' && (dsphur == 11 || (dsptf == 0 && dsphur == 23))) || (b == 'min' && dspmin == 11))).find('span').text((b == 'hur') ? ((dsptf == 0 && (dsphur == 0 || dsphur >= 13)) ? Math.abs(dsphur - 12) : ((dsptf == 1 && dsphur < 10) ? ('0' + dsphur) : dsphur)) : dspmin);
            if (b == 'hur') $(document.body).removeClass('hlock');
            else if (b == 'min') $(document.body).removeClass('mlock')
        });
        $('#hur-bottom-org,#min-bottom-org').on('animationend', function () {
            $(this).removeClass('fadeout')
        });
        $(document.body).trigger('_updateTime');
        init = true
    } else {
        $('#main').remove()
    }
});