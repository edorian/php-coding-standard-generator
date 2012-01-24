<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
    version="1.0" 
    xmlns:pmd="http://pmd.sf.net/ruleset/1.0.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    exclude-result-prefixes="pmd">

    <xsl:output method="html" indent="yes" omit-xml-declaration="yes" encoding="UTF-8" />

    <xsl:template match="/pmd:ruleset">
        <h2>
            <xsl:value-of select="@name"/>
        </h2>
        <p class="ruleset-description">
            <xsl:value-of select="pmd:description"/>
        </p>
        <div class="rule-section" name="{$file}">
            <xsl:apply-templates select="pmd:rule" />
        </div>
    </xsl:template>

    <xsl:template match="pmd:rule">
        <xsl:param name="rule" select="@name"/>
        <div class="rule">
            <div class="rule-header">
                <input class="rule-selector" type="checkbox" id="{$tool}-{$file}/{$rule}" name="{$file}/{$rule}" />
                <div class="rule-name">
                    <label for="{$tool}-{$file}/{$rule}">
                        <xsl:value-of select="$rule"/>
                    </label>
                </div>
                <xsl:apply-templates select="pmd:example" />
                <div style="clear: both">
                </div>
            </div>
            <div class="rule-description">
                <label for="{$file}/{$rule}">
                    <xsl:value-of select="pmd:description" />
                </label>
            </div>
            <xsl:apply-templates select="pmd:properties/pmd:property">
                <xsl:with-param name="rule" select="$rule"/>
                <xsl:with-param name="file" select="$file"/>
            </xsl:apply-templates>
        </div>
    </xsl:template>

    <xsl:template match="pmd:example">
        <div class="rule-example">
            <span>
                Example
                <span>
                    <pre>
                        <xsl:value-of select="text()"/>
                    </pre>
                </span>
            </span>
        </div>
    </xsl:template>

    <xsl:template match="pmd:property">
        <xsl:param name="property" select="@name"/>
        <xsl:param name="rule"/>
        <xsl:param name="file"/>
        <div class="property">
            <xsl:value-of select="@name" />:
            <xsl:element name="input">
                <xsl:choose>
                    <xsl:when test="@value='true' or @value='false'">
                        <xsl:attribute name="type">checkbox</xsl:attribute>
                        <xsl:if test="@value='true'">
                            <xsl:attribute name="checked">checked</xsl:attribute>
                        </xsl:if>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:attribute name="type">text</xsl:attribute>
                        <xsl:attribute name="size">5</xsl:attribute>
                    </xsl:otherwise>
                </xsl:choose>
                <xsl:attribute name="class">property-selector</xsl:attribute>
                <xsl:attribute name="id">property-<xsl:value-of select="$file"/>/<xsl:value-of select="$rule"/>-<xsl:value-of select="$property"/></xsl:attribute>
                <xsl:attribute name="name">
                    <xsl:value-of select="@name"/>
                </xsl:attribute>
                <xsl:attribute name="value">
                    <xsl:value-of select="@value"/>
                </xsl:attribute>
                <xsl:attribute name="default">
                    <xsl:value-of select="@value"/> 
                </xsl:attribute>
            </xsl:element>
            <div class="property-description">
                <label for="property-{$file}/{$rule}-{$property}">
                    <xsl:value-of select="@description" />
                </label>
            </div>
        </div>
    </xsl:template>

</xsl:stylesheet>

