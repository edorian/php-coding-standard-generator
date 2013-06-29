The goal of this project is to provide an easy to use website that allows its users to create and adapt their PHP coding standards.

When it comes to coding standards it is not important which one you choose it is just important that you have one and everyone follows it!

To ease the usage of coding standards this site can help you create and/or understand ruleset.xml files for [PHPMD](http://phpmd.org/) and [PHPCS](http://pear.php.net/package/PHP_CodeSniffer).

When setting up a Continuous Integration environment it can be used complementary to [jenkins-php.org](http://jenkins-php.org) to create the `build/phpmd.xml` and `build/phpcs.xml` files but of course works fine on its own with the command line versions of the respective tools and other Continuous Integration servers.

## Contributing

All contributions are very welcome. If you have questions feel free to find me on IRC (edorian@freenode) or on Twitter (@__edorian).

### Rule updates

The rules the generator knows about are maintained in PMD-Style XML files.

To see if any rules are missing or need to be updated there is a helper utility in `/source`:

     ~/php-coding-standard-generator/source master $ ./phpcsMapper 
    Usage: ./phpcsMapper command <options>

      Available commands: 
        - list <filter>    Prints all available sniffs and if it exists in sniffDocumentation [x], is incomplete [~], or is missing [ ].
        - create <sniff>   Create empty xml structure for the sniff group.
        - todo             Prints a list of all empty description and examples tags.

These basic commands hopefully make it easy to get stared.

Make sure to update the projects for which the rules are generated beforehand using:

    git submodule foreach git pull origin master

### Design

The tool currently looks horrible. If you want to improve it please get in touch, it'd be great :)

### Anything else

Sure :)


## Attributions

This project uses the ruleset xml resources from [PHPMD](https://github.com/manuelpichler/phpmd/tree/master/src/main/resources/rulesets)

Parts of the PHPCS ruleset documentation is based off of the source code comments from [PHP_CodeSniffer](https://github.com/squizlabs/PHP_CodeSniffer)

The respective license are attached in the LICENSE file.

