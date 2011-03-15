var pcsg = pcsg || {};

pcsg.Phpmd = (function() {

    var members = {
        "container": null
    };

    var methods = (function() {
        return {
            add: function() {
                return data.a + data.b;
            },
            renderFile: function(file) {
                $.ajax({
                    type: "GET",
                    url: "resources/phpmd/" + file,
                    dataType: "xml",
                    async: false,
                    success: function(xml) {
                        $(xml).find('ruleset description ').each(function() {;
                            members.container.append("<pre>" + $(this).text() + "</pre>");
                        })
                    }
                });
            }
        }
    })();

    // public 
    return {
        init: function(container) {
            members.container = container;
        },
        render: function() {
            $.ajax({
                type: "GET",
                url: "resources/phpmd/rulesets.json",
                dataType: "json",
                success: function(data) {
                    $.each(data, function() {
                        members.container.append('<h2>' + this + '</h2>');
                        methods.renderFile(this);
                    })
                }
            });
        }
    }
})();

