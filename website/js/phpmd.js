var pcsg = pcsg || {};

pcsg.Phpmd = (function(resourceBasedir, resourceIndex) {

    var members = {
        "container": null,
        "resourceBasedir": resourceBasedir,
        "resourceIndex": resourceIndex,
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
                        members.container.append('<h2>' + $(xml).find('ruleset').attr("name") + '</h2>');
                        desc = $(xml).find('ruleset > description').text();
                        members.container.append("<p class='ruleset-description'>" + desc + "</p>");
                        $(xml).find('ruleset > rule').each(function() {
                            methods.renderRule($(this), file);
                        });
                    }
                });
            },
            renderRule: function(rule, currentRuleFile) {
                ruleContainer = $("<div class='rule'>");
                ruleContainer.appendTo(members.container);
                rulename = currentRuleFile+"/"+rule.attr("name");
                ruleid = "phpmd-"+rulename;
                ruleContainer.append("<input class='rule-selector' type='checkbox' id='"+ruleid+"' name='"+rulename+"'>");
                ruleContainer.append("<div class='rule-name'><label for='"+ruleid+"'>"+rule.attr("name")+"</label></div>");
                ruleContainer.append("<div class='rule-description'><label for='"+ruleid+"'>"+rule.find("description").text()+"</label></div>");
                rule.find('properties property').each(function() {
                    methods.renderProperty($(this), ruleContainer);
                });
            },
            renderProperty: function(property, ruleContainer) {
                prop = $("<div class='property'>");
                prop.appendTo(ruleContainer);
                prop.append(property.attr("name")+": ");
                if(property.attr("value") == "true" || property.attr("value") == "false") {
                    checked = "";
                    if(property.attr("value") == "true") {
                        checked = "checked='checked'";
                    }
                    prop.append("<input type='checkbox' "+checked+" class='property-selector' name='"+property.attr("name")+"' value='"+property.attr("value")+"' default='"+property.attr("value")+"'></input>");
                } else {
                    prop.append("<input type='text' size=5 class='property-selector' name='"+property.attr("name")+"' value='"+property.attr("value")+"' default='"+property.attr("value")+"'></input>");
                }
                prop.append("<div class='property-description'>"+property.attr("description")+"</div>");
            },
            generateXmlInto: function(outputTextarea) {
                xmlContainer = $('<ruleset>');

                rules = "";
                members.container.find(".rule-selector").each(function() {
                    rules = rules + methods.generateRuleXmlForCheckbox($(this));
                });

                outputTextarea.val(
                    '<?xml version="1.0"?>\n'+
                    '<ruleset name="PHP Coding Standard Generator created PHPMD Ruleset" \n'+
                    '    xmlns="http://pmd.sf.net/ruleset/1.0.0" \n'+
                    '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" \n'+
                    '    xsi:schemaLocation="http://pmd.sf.net/ruleset/1.0.0 http://pmd.sf.net/ruleset_xml_schema.xsd"\n'+
                    '    xsi:noNamespaceSchemaLocation="http://pmd.sf.net/ruleset_xml_schema.xsd">\n'+
                    rules+
                    '</ruleset>'
                );
            },
            generateRuleXmlForCheckbox: function(checkbox) {
                if(!checkbox.attr("checked")) {
                    return "";
                } 
                simpleRule = false;
                rule = "";
                properties = checkbox.parent().find(".property-selector");
                if(properties.size() == 0) {
                    simpleRule = true;
                } else {
                    allDefaultValues = true;
                    properties.each(function() {
                        methods.normalizeCheckboxInput($(this));
                        if($(this).attr("value") != $(this).attr("default")) {
                            allDefaultValues = false;
                        }
                    });
                    simpleRule = allDefaultValues; 
                }
                if(simpleRule) {
                    rule = "<rule ref='rulesets/"+checkbox.attr("name")+"'/>\n";
                } else {
                    propertyXml = methods.generatePropertyXml(properties);
                    rule = 
                        "<rule ref='rulesets/"+checkbox.attr("name")+"'>\n"+
                         propertyXml+
                        "</rule>\n"
                    ;
                }
                return rule;
            },
            generatePropertyXml: function(properties) {
                propertiesXml = "    <properties>\n";
                properties.each(function() {
                    methods.normalizeCheckboxInput($(this));
                    if($(this).attr("value") != $(this).attr("default")) {
                        propertiesXml = propertiesXml + "        <property name='"+$(this).attr("name")+"' value='"+$(this).attr("value")+"' />\n";
                    }
                });
                propertiesXml = propertiesXml + "    </properties>\n";
                return propertiesXml;
            },
            normalizeCheckboxInput: function(input) {
                if(input.attr("type") == "checkbox") {
                    if(input.attr("checked")) {
                        input.attr("value", "true");
                    } else {
                        input.attr("value", "false");
                    }
                }
            },
            xmlUpdateError: function(message) {
                $("#phpmd-xml-error").show();
                $("#phpmd-xml-error").text(message);
            },
            xmlUpdateNoError: function() {
                $("#phpmd-xml-error").hide();
                $("#phpmd-xml-error").text("");
            }

        }
    })();

    // public
    return {
        renderInto: function(container, xmlContainer) {
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
                        methods.generateXmlInto(xmlContainer);
                    });
                    $('.property-selector').change(function() {
                        methods.generateXmlInto(xmlContainer);
                    });

                }
            });
        },
        xmlUpateHandler: function(updatedXmlString, renderedPage) {
            try {
                xml = $.parseXML(updatedXmlString);
            } catch(err) {
                methods.xmlUpdateError("Invalid Xml");
                return;
            }
            rules = $(xml).find("ruleset rule");
            if(rules.length == 0) {
                methods.xmlUpdateError("Couldn't find any rules");
                return;
            }
            methods.xmlUpdateNoError();
            $('.rule-selector').attr("checked", "");
            $('.property-selector').each(function() {
                $(this).attr("value", $(this).attr("default"));
            });
            rules.each(function() {
                ruleidSelector = "#phpmd-"+$(this).attr("ref").substring(9).replace(/(:|\.|\/)/g,'\\$1');
                $(ruleidSelector).attr("checked", "checked");
                $(this).find("property").each(function() {
                    checkbox = $(ruleidSelector).parent().find("input[name='"+$(this).attr("name")+"']");
                    xmlValue = $(this).attr("value");
                    if(checkbox.attr("type") == "checkbox") {
                        if(xmlValue != "true" && xmlValue != "false") {
                            methods.xmlUpdateError("The property: '"+$(this).attr("name")+"' should only have 'true' or 'false' as a value");
                        } else if(xmlValue == "true") {
                            checkbox.attr("checked", "checked");
                        } else {
                            checkbox.attr("checked", "");
                        }
                    } else {
                        checkbox.attr("value", xmlValue);
                    }
                });
            });
        }
    }
});

