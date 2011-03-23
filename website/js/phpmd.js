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
                        desc = $(xml).find('ruleset > description').text();
                        members.container.append("<pre class='ruleset-description'>" + desc + "</pre>");
                        $(xml).find('ruleset > rule').each(methods.renderRule);
                    }
                });
            },
            renderRule: function() {
                rule = $("<div class='rule'>");
                rule.appendTo(members.container);
                rule.append("<input class='rule-selector' type='checkbox' name='"+$(this).attr("class")+"'>");
                rule.append("<div class='rule-name'>"+$(this).attr("name")+"</div>");
                rule.append("<div class='rule-description'>"+$(this).find("description").text()+"</div>");
                $(this).find('properties property').each(function() {
                    methods.renderProperty(rule, $(this));
                });
            },
            renderProperty: function(rule, property) {
                prop = $("<div class='property'>");
                prop.appendTo(rule);
                prop.append(property.attr("name"));
                prop.append(": <input class='property-value' name='"+property.attr("name")+"' value='"+property.attr("value")+"'></input>");
            },

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

