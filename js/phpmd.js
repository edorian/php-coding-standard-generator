var pcsg = pcsg || {};

pcsg.Phpmd = (function(resourceBasedir, resourceIndex) {

    var members = {
        "container": null,
        "resourceBasedir": resourceBasedir,
        "resourceIndex": resourceIndex,
        "currentFile": null
    }

    var methods = (function() {
        return {
            add: function() {
                return data.a + data.b;
            },
            renderFile: function(file) {
                members.currentFile = file;
                $.ajax({
                    type: "GET",
                    url: members.resourceBasedir + file,
                    dataType: "xml",
                    async: false,
                    success: function(xml) {
                        members.container.append('<h2>' + $(xml).find('ruleset').attr("name") + '</h2>');
                        desc = $(xml).find('ruleset > description').text();
                        members.container.append("<pre class='ruleset-description'>" + desc + "</pre>");
                        $(xml).find('ruleset > rule').each(methods.renderRule);
                    }
                });
            },
            renderRule: function() {
                rule = $("<div class='rule'>");
                rule.appendTo(members.container);
                rule.append("<input class='rule-selector' type='checkbox' name='"+members.currentFile+"/"+$(this).attr("name")+"'>");
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
                prop.append(": <input type='text' size=5 class='property-value' name='"+property.attr("name")+"' value='"+property.attr("value")+"'></input>");
                prop.append("<div class='property-description'>"+property.attr("description")+"</div>");
            },
            generateXmlInto: function(outputTextarea) {
                xmlContainer = $('<ruleset>');

                rules = "";
                members.container.find(".rule-selector").each(function() {
                    checkbox = $(this);
                    if(checkbox.attr("checked")) {
                        //xmlContainer.append($("<rule ref='rulesets/"+checkbox.attr("name")+"'/>"));
                        rules = rules + "<rule ref='rulesets/"+checkbox.attr("name")+"'/>\n"; 
                    }
                });

                outputTextarea.text(
                    '<?xml version="1.0"?>\n'+
                    '<ruleset name="PHP Coding Standard Generator created PHPMD Ruleset" \n'+
                    '    xmlns="http://pmd.sf.net/ruleset/1.0.0" \n'+
                    '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" \n'+
                    '    xsi:schemaLocation="http://pmd.sf.net/ruleset/1.0.0 http://pmd.sf.net/ruleset_xml_schema.xsd"\n'+
                    '    xsi:noNamespaceSchemaLocation="http://pmd.sf.net/ruleset_xml_schema.xsd">\n'+
                    rules+
                    '</ruleset>'
                    //xmlContainer.html()
                );
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
                        methods.renderFile(this);
                    });
                    generate = $("<input type='submit' name='build-phpmd' value='Generate XML'>");
                    outputArea = $("<textarea id='phpmd-xml' class='xmloutput'>Your XML will go here</textarea>");
                    generate.click(function() {
                        methods.generateXmlInto(outputArea);
                    });
                    container.append(generate);
                    container.append(outputArea);
                }
            });
        },
    }
});
