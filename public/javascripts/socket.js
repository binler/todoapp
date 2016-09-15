$(function() {
    var socket = io();
    var $window = $(window);


    /**
     * Get Current time when submit message
     * @return current time type h:m:s
     */
    function getCurrentTime(t) {
        var currentTime = t || new Date();
        var h = currentTime.getHours(),
            m = currentTime.getMinutes();
        if (h < 10) {
            h = '0' + h
        };
        if (m < 10) {
            m = '0' + m
        };
        return h + ':' + m;
    }

    /**
     * Scroll to bottom when submit message to see newest message
     * @param  speed : Speed to scroll
     * @return void
     */
    function loadMessage(speed) {
        var s = speed || 500;
        var h = $("#messages").get(0).scrollHeight;
        $("#messages").animate({
            scrollTop: h
        }, s);
    }

    $window.load(function() {
        loadMessage(100);
    });


    $window.keydown(function(event) {
        if (event.which === 13) {
            var inputMessage = $('#m').val();
            if (inputMessage) {
                $('#m').val('');
                socket.emit('chat message', {
                    message: inputMessage,
                    created_at: getCurrentTime()
                });
            }
        }
    });

    socket.on('chat message', function(data) {
        $('#messages').append('<li>' + data.message + '</br>' + '<span class="time-create">' + data.created_at + '</span>' + '</li>');
        loadMessage(500);
    });


});
