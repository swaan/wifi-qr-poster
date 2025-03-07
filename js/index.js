// Taken from
// https://github.com/evgeni/qifi
// Author: Evgeni Golov
// MIT License
function escape_string(string) {
    var to_escape = ['\\', ';', ',', ':', '"'];
    var hex_only = /^[0-9a-f]+$/i;
    var output = "";
    for (var i = 0; i < string.length; i++) {
        if ($.inArray(string[i], to_escape) != -1) {
            output += '\\' + string[i];
        } else {
            output += string[i];
        }
    }
    if (hex_only.test(output)) {
        output = '"' + output + '"';
    }
    return output;
}

function sanitize_filename(str) {
    return str
        .replace(/[\/\\:*?"<>|]/g, '_')
        .replace(/\s+/g, '_')
        .substring(0, 50);
}

function generate() {
    var ssid = $('#ssid').val();
    var encryption = $('#encryption').val();
    var hidden = $('#hidden').is(':checked');
    var hide_key = $('#hide-key').is(':checked');

    if (encryption != 'nopass') {
        var key = $('#key').val();
    } else {
        var key = '';
    }

    var qrstring = 
        'WIFI:S:' + 
        escape_string(ssid) +
        ';T:' +
        encryption +
        ';P:' +
        escape_string(key) + ';';

    if (hidden) {
        qrstring += 'H:true';
    }

    qrstring += ';';

    $('.print .ssid .text').text(ssid);
    $('.print .key .text').text(key);

    $('#qrcode').empty();
    $('#qrcode').qrcode({
        width: 720,
        height: 720,
        text: qrstring
    });

    if (hide_key) {
        $('.print .key').hide();
    } else {
        $('.print .key').show();
    }

    // Generate PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    var sanitized_ssid = sanitize_filename(ssid);
    var filename = 'wifi-poster_' + sanitized_ssid + '.pdf';

    const wifiImg = new Image();
    wifiImg.src = 'img/wifi.jpg';
    wifiImg.onload = function() {
        doc.addImage(wifiImg, 'JPEG', 90, 20, 30, 30);

        doc.setFontSize(70);
        doc.setFont('helvetica', 'normal');
        doc.text(ssid, 105, 75, { align: 'center' }); // Y increased to 75mm

        if (!hide_key) {
            const keyImg = new Image();
            keyImg.src = 'img/key.jpg';
            keyImg.onload = function() {
                doc.setFontSize(30);
                doc.setFont('helvetica', 'normal');
                const keyWidth = doc.getTextWidth(key);
                const textX = 105; // Text center at 105mm
                const textStartX = textX - (keyWidth / 2); // Left edge of text
                const iconX = textStartX - 17; // Icon 2mm left of text (15mm icon + 2mm gap)
                doc.addImage(keyImg, 'JPEG', iconX, 87, 15, 15);
                doc.text(key, textX, 98, { align: 'center' }); // Text centered at 105mm

                const qrCanvas = $('#qrcode canvas')[0];
                const qrDataUrl = qrCanvas.toDataURL('image/jpeg', 0.9);
                doc.addImage(qrDataUrl, 'JPEG', 45, 110, 120, 120);

                doc.save(filename);
            };
        } else {
            const qrCanvas = $('#qrcode canvas')[0];
            const qrDataUrl = qrCanvas.toDataURL('image/jpeg', 0.9);
            doc.addImage(qrDataUrl, 'JPEG', 45, 110, 120, 120);

            doc.save(filename);
        }
    };
}