var pcsg = pcsg || {};

pcsg.Phpmd = (function(resourceBasedir, resourceIndex) {

    var members = {
        "container": null,
        "resourceBasedir": resourceBasedir,
        "resourceIndex": resourceIndex
    }

    var methods = (function() {
        return {
            add: function() {
                return data.a + data.b;
            },
            renderFile: function(file) {
                $.ajax({
                    type: "GET",
                    url: members.resourceBasedir + file,
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
        renderInto: function(container) {
            members.container = container;
            $.ajax({
                type: "GET",
                url: members.resourceBasedir + members.resourceIndex,
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
});

