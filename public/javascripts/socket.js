$(function() {
    var socket = io();
    var $window = $(window);

    function getCurrentTime() {
        var currentTime = new Date;
        var h = currentTime.getHours();
        var m = currentTime.getMinutes();
        if (h < 10) {
            h = '0' + h
        };
        if (m < 10) {
            m = '0' + m
        };
        return h + ':' + m;
    }

    $window.keydown(function(event) {
        if (event.which === 13) {
            var inputMessage = $('#m').val(),
                currentTime = getCurrentTime();

            if (inputMessage) {
                $('#m').val('');
                socket.emit('chat message', {
                    message: inputMessage,
                    created_at: new Date()
                });
            }
        }
    });

    socket.on('chat message', function(data) {
        $('#messages').append('<li>' + data.message + '</br>' + '<span class="time-create">' + data.created_at + '</span>' + '</li>');
    });


});
