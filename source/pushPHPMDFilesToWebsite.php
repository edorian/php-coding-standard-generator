<?php

$phpmdRulesets = glob(__DIR__.'/../externals/phpmd/src/main/resources/rulesets/*');
$websiteTargetPath = __DIR__.'/../website/resources/phpmd/';

$rulesetNames = array();

foreach($phpmdRulesets as $ruleset) {

    $rulesetName = basename($ruleset);

    copy($ruleset, $websiteTargetPath.$rulesetName);
    $rulesetNames[] = $rulesetName;

}

file_put_contents($websiteTargetPath."rulesets.json", json_encode($rulesetNames));

