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
                        rulefileContainer = $("<div class='rule-section' name='"+file+"'>");
                        members.container.append(rulefileContainer);
                        $(xml).find('ruleset > rule').each(function() {
                            methods.renderRule($(this), file, rulefileContainer);
                        });
                    }
                });
            },
            renderRule: function(rule, currentRuleFile, rulefileContainer) {
                ruleContainer = $("<div class='rule'>");
                ruleContainer.appendTo(rulefileContainer);
                rulename = currentRuleFile+"/"+rule.attr("name");
                ruleid = "phpmd-"+rulename;
                ruleHeader = $("<div class='rule-header'>");
                ruleHeader.append("<input class='rule-selector' type='checkbox' id='"+ruleid+"' name='"+rulename+"'>");
                ruleHeader.append("<div class='rule-name'><label for='"+ruleid+"'>"+rule.attr("name")+"</label></div>");
                example = rule.find("example").text().trim().replace("\n", "<br/>");
                if(example != "") {
                    ruleHeader.append("<div class='rule-example'><span>Example<span><pre>"+example+"</pre></span></span></div>");
                }
                ruleHeader.append("<div style='clear: both'></div>");
                ruleHeader.appendTo(ruleContainer);
                ruleContainer.append("<div class='rule-description'><label for='"+ruleid+"'>"+rule.find("description").text()+"</label></div>");
                rule.find('properties property').each(function() {
                    methods.renderProperty($(this), ruleContainer, rulename);
                });
            },
            renderProperty: function(property, ruleContainer, rulename) {
                prop = $("<div class='property'>");
                prop.appendTo(ruleContainer);
                prop.append(property.attr("name")+": ");
                propertyid = "property-"+rulename+"-"+property.attr("name");
                if(property.attr("value") == "true" || property.attr("value") == "false") {
                    checked = "";
                    if(property.attr("value") == "true") {
                        checked = "checked='checked'";
                    }
                    prop.append("<input type='checkbox' "+checked+" class='property-selector' id='"+propertyid+"' name='"+property.attr("name")+"' value='"+property.attr("value")+"' default='"+property.attr("value")+"'></input>");
                } else {
                    prop.append("<input type='text' size=5 class='property-selector' id='"+propertyid+"' name='"+property.attr("name")+"' value='"+property.attr("value")+"' default='"+property.attr("value")+"'></input>");
                }
                prop.append("<div class='property-description'><label for='"+propertyid+"'>"+property.attr("description")+"</label></div>");
            },
            generateXmlInto: function(outputTextarea) {
                xmlContainer = $('<ruleset>');

                rules = "";

                members.container.find(".rule-section").each(function() {
                    rules = rules + methods.generateRulesXmlForSection($(this));
                });

                outputTextarea.val(
                    '<?xml version="1.0"?>\n'+
                    '<ruleset name="'+$("#phpmd-ruleset-name").val()+'" \n'+
                    '    xmlns="http://pmd.sf.net/ruleset/1.0.0" \n'+
                    '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" \n'+
                    '    xsi:schemaLocation="http://pmd.sf.net/ruleset/1.0.0 http://pmd.sf.net/ruleset_xml_schema.xsd"\n'+
                    '    xsi:noNamespaceSchemaLocation="http://pmd.sf.net/ruleset_xml_schema.xsd">\n'+
                    '<description>'+$("#phpmd-ruleset-description").val()+'\n</description>\n'+
                    rules+
                    '</ruleset>'
                );
            },
            generateRulesXmlForSection: function(section) {
                rules = "";
                file = section.attr("name");
                allRulesAreActiveAndSimple = true;
                section.find(".rule-selector").each(function() {
                    checkbox = $(this);
                    if(!checkbox.attr("checked") || !methods.generateIsSimpleRule(checkbox) ) {
                        allRulesAreActiveAndSimple = false;
                    }
                });
                if(allRulesAreActiveAndSimple) {
                    return "<rule ref='rulesets/" + section.attr("name") + "'/>\n";
                }
                section.find(".rule-selector").each(function() {
                    rules = rules + methods.generateRuleXmlForCheckbox($(this));
                });
                return rules;

            },
            generateIsSimpleRule: function(checkbox) {
                simpleRule = false;
                rule = "";
                properties = checkbox.parent().parent().find(".property-selector");
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
                return simpleRule;
            },
            generateRuleXmlForCheckbox: function(checkbox) {
                if(!checkbox.attr("checked")) {
                    return "";
                }
                if(methods.generateIsSimpleRule(checkbox)) {
                    rule = "<rule ref='rulesets/"+checkbox.attr("name")+"'/>\n";
                } else {
                    properties = checkbox.parent().parent().find(".property-selector");
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
                    members.container.append('Ruleset name: <input type="text" id="phpmd-ruleset-name" size="30" value="pcsg-generated-ruleset" /><br /><br />');
                    members.container.append(
                        'Ruleset description:<br />'+
                        '<textarea id="phpmd-ruleset-description">'+
                            'Created with the PHP Coding Standard Generator.\n'+
                            'http://edorian.github.com/php-coding-standard-generator/'+
                        '</textarea>'
                    );
                    $.each(data, function() {
                        methods.renderFile(this);
                    });
                    generate = function() {
                        methods.generateXmlInto(xmlContainer);
                    };
                    $('.rule').click(generate);
                    $('.property-selector').change(generate);
                    $('.property-selector').keyup(generate);
                    $('#phpmd-ruleset-name').keyup(generate);
                    $('#phpmd-ruleset-description').keyup(generate);
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
            $("#phpmd-ruleset-name").val($(xml).find("ruleset").attr("name"));
            $("#phpmd-ruleset-description").val($(xml).find("description").text().trim());
            $('.rule-selector').attr("checked", "");
            $('.property-selector').each(function() {
                $(this).attr("value", $(this).attr("default"));
            });
            rules.each(function() {
                ruleidSelector = $(this).attr("ref").substring(9).replace(/(:|\.|\/)/g,'\\$1');
                // All rules of this ruleset type rule ( <rule ref="rulesets/unusedcode.xml"/> )
                if(ruleidSelector.match(".xml$") == ".xml") {
                    $(".rule-section[name='"+ruleidSelector+"']").find(".rule-selector").attr("checked", "checked");
                    // And uncheck the <exclude> ones again
                    $(this).find("exclude").each(function() {
                        selector = "#phpmd-" + ruleidSelector + "\\/" + $(this).attr("name");
                        $(selector).parent().parent().find("input").attr("checked", "");
                    });
                    return;
                }
                ruleidSelector = "#phpmd-" + ruleidSelector;
                $(ruleidSelector).attr("checked", "checked");
                $(this).find("property").each(function() {
                    checkbox = $(ruleidSelector).parent().parent().find("input[name='"+$(this).attr("name")+"']");
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

