
function phpmd_init(into) {

    $.ajax({
        type: "GET",
        url: "resources/phpmd/rulesets.json",
        dataType: "json",
        success: function(data) {
            $.each(data, function() {
                into.append('<h2>' + this + '</h2>');
                phpmd_file(this, into);
            })
        }
    });

}

function phpmd_file(file, into) {

    $.ajax({
        type: "GET",
        url: "resources/phpmd/" + file,
        dataType: "xml",
        async: false,
        success: function(xml) {
            $(xml).find('ruleset description').each(function() {;
                into.append("<pre>" + $(this).text() + "</pre>");
            })
        }
    });

}

