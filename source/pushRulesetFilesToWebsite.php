<?php

$rulesets = array(
    'phpmd' => array(
        'rulesets' => glob(__DIR__.'/../externals/phpmd/src/main/resources/rulesets/*'),
        'target' => __DIR__.'/../website/resources/phpmd/'
    ),
    'phpcs' => array(
        'rulesets' => glob(__DIR__.'/phpcs/*'),
        'target' => __DIR__.'/../website/resources/phpcs/'
    ),
);

foreach($rulesets as $rulesetConfig)  {

    $rulesetNames = array();

    foreach($rulesetConfig['rulesets'] as $ruleset) {

        $rulesetName = basename($ruleset);

        copy($ruleset, $rulesetConfig['target'].$rulesetName);
        $rulesetNames[] = $rulesetName;

    }

    file_put_contents($rulesetConfig['target'].'rulesets.json', json_encode($rulesetNames));
}

