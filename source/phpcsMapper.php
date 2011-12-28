<?php

$filter = '';


foreach(glob(__DIR__ . '/../externals/phpcs/CodeSniffer/Standards/*') as $standard) {

    if(is_dir($standard)) {
        $standardName = basename($standard);
        foreach(glob($standard . '/Sniffs/*') as $sniffGroup) {
            $sniffGroupName = basename($sniffGroup);
            $name = $standardName . '.' . $sniffGroupName;
            if(!$filter || strpos($filter, $name) !== false) {
                echo $name, PHP_EOL;
            }
        }
    }

}


