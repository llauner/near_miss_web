var _helpFileContent = null;

function showHelp() {
    // Get content from file
    jQuery.get('/help.html', function (data) {
        data = data.replace(/(\r\n|\n|\r)/gm, "");
        _helpFileContent = data;

        _map.fire('modal',
            {
                content: _helpFileContent,
                closeTitle: 'close', // alt title of the close button
                zIndex: 10000, // needs to stay on top of the things
                transitionDuration: 300, // expected transition duration


            });
    });

    
}