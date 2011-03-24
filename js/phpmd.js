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
                rulename = members.currentFile+"/"+$(this).attr("name");
                ruleid = "phpmd-"+rulename;
                rule.append("<input class='rule-selector' type='checkbox' id='"+ruleid+"' name='"+rulename+"'>");
                rule.append("<div class='rule-name'><label for='"+ruleid+"'>"+$(this).attr("name")+"</label></div>");
                rule.append("<div class='rule-description'><label for='"+ruleid+"'>"+$(this).find("description").text()+"</label></div>");
                $(this).find('properties property').each(function() {
                    methods.renderProperty(rule, $(this));
                });
            },
            renderProperty: function(rule, property) {
                prop = $("<div class='property'>");
                prop.appendTo(rule);
                prop.append(property.attr("name"));
                prop.append(": <input type='text' size=5 class='property-value' name='"+property.attr("name")+"' value='"+property.attr("value")+"' default='"+property.attr("value")+"'></input>");
                prop.append("<div class='property-description'>"+property.attr("description")+"</div>");
            },
            generateXmlInto: function(outputTextarea) {
                xmlContainer = $('<ruleset>');

                rules = "";
                members.container.find(".rule-selector").each(function() {
                    checkbox = $(this);
                    if(!checkbox.attr("checked")) {
                        return;
                    } 
                    simpleRule = false;
                    properties = $(this).parent().find(".property-value");
                    if(properties.size() == 0) {
                        simpleRule = true;
                    } else {
                        allDefaultValues = true;
                        properties.each(function() {
                            prop = $(this);
                            if(prop.attr("value") != prop.attr("default")) {
                                allDefaultValues = false;
                            }
                        });
                        simpleRule = allDefaultValues; 
                    }
                    if(simpleRule) {
                        rules = rules + "<rule ref='rulesets/"+checkbox.attr("name")+"'/>\n";
                    } else {
                        rule = "    <properties>\n";
                        properties.each(function() {
                            if($(this).attr("value") != $(this).attr("default")) {
                                rule = rule + "        <property name='"+$(this).attr("name")+" value='"+$(this).attr("value")+"' />\n";
                            }
                        });
                        rule = rule + "    </properties>\n";
                        rules = rules+
                            "<rule ref='rulesets/"+checkbox.attr("name")+">\n"+
                             rule+
                            "</rule>\n"
                        ;
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
                    $('.rule').click(function() {
                        methods.generateXmlInto($('#phpmd-xml'));
                    });
                    $('.property-value').change(function() {
                        methods.generateXmlInto($('#phpmd-xml'));
                    });

                }
            });
        },
    }
});

