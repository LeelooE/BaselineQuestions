<?php

//IN: JSON - OUT:JSON
function summary($json_data) {
	$data = json_decode($json_data,true);
	$val = 0;
	$titles = "";
	
	foreach ($data as $value) {

		if(array_key_exists('titleOfArticle0', $value)) {
			$titles = $titles + "_" + $value['titleOfArticle0'] + "_";
			
		}

		if(array_key_exists('titleOfArticle1', $value)) {
			$titles = $titles + "_" + $value['titleOfArticle1'] + "_";
			
		}
	}
	
	$summary = array('titles'=>$titles);
	return json_encode($summary);
}

//READ db_data.json
$json_data = file_get_contents("db_data.json");
//PROCESS DATA
$json_summary = summary($json_data);
//SAVE summary.json
$f_summary = fopen('summary.json', 'w');
fwrite($f_summary, $json_summary);
fclose($f_summary);
?>