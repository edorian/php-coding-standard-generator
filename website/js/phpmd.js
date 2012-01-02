var pcsg = pcsg || {};

pcsg.Phpmd = function(resourceBasedir, resourceIndex) {

    var that = {}

    that.members = {
        "name": 'phpmd',
        "collapseRules": true,
        "container": null,
        "errorContainer": null,
        "resourceBasedir": resourceBasedir,
        "resourceIndex": resourceIndex,
    }

    that.methods = {
        renderFile: function(file) {
            $.ajax({
                type: "GET",
                url: that.members.resourceBasedir + file,
                dataType: "xml",
                async: false,
                success: function(xml) {
                    that.members.container.append('<h2>' + $(xml).find('ruleset').attr("name") + '</h2>');
                    desc = $(xml).find('ruleset > description').text();
                    that.members.container.append("<p class='ruleset-description'>" + desc + "</p>");
                    rulefileContainer = $("<div class='rule-section' name='"+file+"'>");
                    that.members.container.append(rulefileContainer);
                    $(xml).find('ruleset > rule').each(function() {
                        that.methods.renderRule($(this), file, rulefileContainer);
                    });
                }
            });
        },
        renderRule: function(rule, currentRuleFile, rulefileContainer) {
            ruleContainer = $("<div class='rule'>");
            ruleContainer.appendTo(rulefileContainer);
            rulename = that.methods.parser.getRulename(currentRuleFile, rule.attr("name"));
            ruleid = that.members.name+"-"+rulename;
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
                that.methods.renderProperty($(this), ruleContainer, rulename);
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

            that.members.container.find(".rule-section").each(function() {
                rules = rules + that.methods.generateRulesXmlForSection($(this));
            });
            
            outputTextarea.val(
                that.methods.generator.generateHeader(
                    $("#"+that.members.name+"-ruleset-name").val(),
                    $("#"+that.members.name+"-ruleset-description").val(),
                    rules
                )
            );
        },
        generateRulesXmlForSection: function(section) {
            rules = "";
            file = section.attr("name");
            allRulesAreActiveAndSimple = true;
            section.find(".rule-selector").each(function() {
                checkbox = $(this);
                if(!checkbox.attr("checked") || !that.methods.generateIsSimpleRule(checkbox) ) {
                    allRulesAreActiveAndSimple = false;
                }
            });
            if(allRulesAreActiveAndSimple && that.members.collapseRules) {
                return '<rule ref="rulesets/' + section.attr("name") + '"/>\n';
            }
            section.find(".rule-selector").each(function() {
                rules = rules + that.methods.generateRuleXmlForCheckbox($(this));
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
                    that.methods.normalizeCheckboxInput($(this));
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
            if(that.methods.generateIsSimpleRule(checkbox)) {
                rule = that.methods.generator.generateSimpleRule(checkbox.attr("name"));
            } else {
                properties = checkbox.parent().parent().find(".property-selector");
                propertyXml = that.methods.generatePropertyXml(properties);
                rule = that.methods.generator.generateRuleWithProperties(
                    checkbox.attr("name"),
                    propertyXml
                );
            }
            return rule;
        },
        generatePropertyXml: function(properties) {
            propertiesXml = "    <properties>\n";
            properties.each(function() {
                that.methods.normalizeCheckboxInput($(this));
                if($(this).attr("value") != $(this).attr("default")) {
                    propertiesXml = propertiesXml + '        <property name="' + $(this).attr("name") + '" value="' + $(this).attr("value")+'"/>\n';
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
            that.members.errorContainer.show();
            that.members.errorContainer.text(message);
        },
        xmlUpdateNoError: function() {
            that.members.errorContainer.hide();
            that.members.errorContainer.text("");
        }

    };

    that.methods.generator = {

        generateHeader: function(name, description, rules) {
            output = 
                '<?xml version="1.0" encoding="UTF-8"?>\n'+
                '<ruleset name="'+name+'" \n'+
                '    xmlns="http://pmd.sf.net/ruleset/1.0.0" \n'+
                '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" \n'+
                '    xsi:schemaLocation="http://pmd.sf.net/ruleset/1.0.0 http://pmd.sf.net/ruleset_xml_schema.xsd"\n'+
                '    xsi:noNamespaceSchemaLocation="http://pmd.sf.net/ruleset_xml_schema.xsd">\n'+
                '<description>'+description+'\n</description>\n'+
                rules+
                '</ruleset>'
            ;
            return output;
        },
        generateSimpleRule: function(name) {
            return '<rule ref="rulesets/' + name + '"/>\n';
        },
        generateRuleWithProperties: function(name, properties) {
           return '<rule ref="rulesets/' + name + '">\n' + propertyXml + '</rule>\n';
        }
    }

    that.methods.parser = {
        getRulename: function(ruleFile, name) {
            return ruleFile+"/"+name;
        }
    }

    // public
    
    that.renderInto = function(container, xmlContainer, errorContainer) {
        that.members.container = container;
        that.members.errorContainer = errorContainer;
        $.ajax({
            type: "GET",
            url: that.members.resourceBasedir + that.members.resourceIndex,
            dataType: "json",
            success: function(data) {
                rulesetNameId = that.members.name + '-ruleset-name';
                rulesetDescriptionId = that.members.name + '-ruleset-description';
                that.members.container.append('Ruleset name: <input type="text" id="'+rulesetNameId+'" size="30" value="pcsg-generated-ruleset"/><br /><br />');
                that.members.container.append(
                    'Ruleset description:<br />'+
                    '<textarea id="'+rulesetDescriptionId+'" class="ruleset-description">'+
                        'Created with the PHP Coding Standard Generator.\n'+
                        'http://edorian.github.com/php-coding-standard-generator/'+
                    '</textarea>'
                );
                $.each(data, function() {
                    that.methods.renderFile(this); 
                });
                generate = function() { 
                    that.methods.generateXmlInto(xmlContainer);
                };
                $('.rule').click(generate);
                $('.property-selector').change(generate); 
                $('.property-selector').keyup(generate); 
                $('#'+rulesetNameId).keyup(generate);
                $('#'+rulesetDescriptionId).keyup(generate);
            }
        });
    };
    that.xmlUpateHandler = function(updatedXmlString, renderedPage) {
        try {
            xml = $.parseXML(updatedXmlString);
        } catch(err) {
            that.methods.xmlUpdateError("Invalid Xml");
            return;
        }
        rules = $(xml).find("ruleset rule");
        if(rules.length == 0) {
            that.methods.xmlUpdateError("Couldn't find any rules");
            return;
        }
        that.methods.xmlUpdateNoError();
        $("#" + that.members.name + "-ruleset-name").val($(xml).find("ruleset").attr("name"));
        $("#" + that.members.name + "-ruleset-description").val($(xml).find("description").text().trim());
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
                    selector = "#" + that.members.name + "-" + ruleidSelector + "\\/" + $(this).attr("name");
                    $(selector).parent().parent().find("input").attr("checked", "");
                });
                return;
            }
            ruleidSelector = "#" + that.members.name + "-" + ruleidSelector;
            $(ruleidSelector).attr("checked", "checked");
            $(this).find("property").each(function() {
                checkbox = $(ruleidSelector).parent().parent().find("input[name='"+$(this).attr("name")+"']");
                xmlValue = $(this).attr("value");
                if(checkbox.attr("type") == "checkbox") {
                    if(xmlValue != "true" && xmlValue != "false") {
                        that.methods.xmlUpdateError("The property: '"+$(this).attr("name")+"' should only have 'true' or 'false' as a value");
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
    };
    return that;
};

pcsg.Phpcs = function(resourceBasedir, resourceIndex) {

    var that = pcsg.Phpmd(resourceBasedir, resourceIndex);
    that.members.name = 'phpcs';
    that.members.collapseRules = false;

    that.methods.generator.generateHeader = function(name, description, rules) {
        output = 
            '<?xml version="1.0" encoding="UTF-8"?>\n'+
            '<ruleset name="'+name+'">\n'+
            '<description>'+description+'\n</description>\n'+
            rules+
            '</ruleset>'
        ;
        return output;
    }
    that.methods.generator.generateSimpleRule = function(name) {
        return '<rule ref="' + name + '"/>\n';
    },
    that.methods.generator.generateRuleWithProperties = function(name, properties) {
        return '<rule ref="' + name + '">\n' + propertyXml + '</rule>\n';
    }

    that.methods.parser.getRulename = function(ruleFile, name) {
        return ruleFile.substr(0, ruleFile.length-3) + name;
    }
    return that;
}

