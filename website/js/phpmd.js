var pcsg = pcsg || {};

pcsg.Phpmd = function(resourceBasedir, resourceIndex, container, errorContainer) {

    var that = {}

    that.members = {
        "name": 'phpmd',
        "collapseRules": true,
        "container": container,
        "errorContainer": errorContainer,
        "resourceBasedir": resourceBasedir,
        "resourceIndex": resourceIndex,
    }

    that.methods = {
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
        },
        extractRuleidSelector: function(ref) {
            return ref.substring(9).replace(/(:|\.|\/)/g,'\\$1');
        }
    }

    // public
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
            ruleidSelector = that.methods.parser.extractRuleidSelector($(this).attr("ref"));
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

pcsg.Phpcs = function(resourceBasedir, resourceIndex, container, errorContainer) {
    
    var that = pcsg.Phpmd(resourceBasedir, resourceIndex, container, errorContainer);
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
    }
    that.methods.generator.generateRuleWithProperties = function(name, properties) {
        return '<rule ref="' + name + '">\n' + propertyXml + '</rule>\n';
    }
    that.methods.parser.getRulename = function(ruleFile, name) {
        return ruleFile.substr(0, ruleFile.length-3) + name;
    }
    that.methods.parser.extractRuleidSelector = function(ref) {
        return ref.replace(/(:|\.|\/)/g,'\\$1');
    }
    return that;
}

