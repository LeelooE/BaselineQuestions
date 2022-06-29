<?php

//IN: JSON - OUT:JSON
function summary($json_data) {
	$data = json_decode($json_data,true);
	$totalScore = 0;
	$countScore = 0;
	$totalTime = 0;
	$countTime = 0;
	$totalPrediction = 0;
	$countPrediction = 0;
	$totalResultScore = 0;
	$countResultScore = 0;

	foreach ($data as $value) {

		if(array_key_exists('nonVisualQuestionTwoFinishTime', $value)) {
			if(array_key_exists('articleThreeFinishTime', $value)) {
				$timeOneV = $value['nonVisualQuestionOneFinishTime'] - $value['articleOneFinishTime'];
				$timeOneNV = $value['visualQuestionOneFinishTime'] - $value['nonVisualQuestionOneFinishTime'];
				$timeOneImg = $value['imageQuestionOneFinishTime'] - $value['visualQuestionOneFinishTime'];
				$timeTwoV = $value['nonVisualQuestionTwoFinishTime'] - $value['articleTwoFinishTime'];
				$timeTwoNV = $value['visualQuestionTwoFinishTime'] - $value['nonVisualQuestionTwoFinishTime'];
				$timeTwoImg = $value['imageQuestionTwoFinishTime'] - $value['visualQuestionTwoFinishTime'];
				$timeThreeV = $value['nonVisualQuestionThreeFinishTime'] - $value['articleThreeFinishTime'];
				$timeThreeNV = $value['visualQuestionThreeFinishTime'] - $value['nonVisualQuestionThreeFinishTime'];
				$timeThreeImg = $value['imageQuestionThreeFinishTime'] - $value['visualQuestionThreeFinishTime'];
				$totalT = $timeOneV + $timeOneNV + $timeOneImg + $timeTwoV + $timeTwoNV + $timeTwoImg + $timeThreeV + $timeThreeNV + $timeThreeImg;

				$r = $value['totalScore'] - 2.25;
				$scoreVal = max($r, 0);
				$avgTimePerQ = ($totalT / 9) / 1000;
				$n = $avgTimePerQ / 5;
				$e = $n - 6;
				$n6 = 1 + exp($e);
				$n60 = 60 / $n6;
				$timeVal = max($n60, 0);
				$resScore = $scoreVal * $timeVal + ($value['totalScore']*5);
				$totalResultScore = $totalResultScore + $resScore;
				$countResultScore = $countResultScore + 1;
			}
			
		}

		if (array_key_exists('totalScore', $value)) {
			$totalScore = $totalScore + $value['totalScore'];
			$countScore = $countScore + 1;
		}
		if (array_key_exists('articleTimeTotal', $value)) {
			$totalTime = $totalTime + $value['articleTimeTotal'];
			$countTime = $countTime + 1;
			if (array_key_exists('totalWords', $value)) {
				if ($value['articleTimeTotal'] > 15) {
					$prediction = (50 * 365 * 8 * 60) * ($value['totalWords'] / ($value['articleTimeTotal'] / 60));
					$totalPrediction = $totalPrediction + $prediction;
					$countPrediction = $countPrediction + 1;
				}
			}
		}
	}
	$averageScore = 0;
	if ($countScore > 0) {
		$averageScore = $totalScore / $countScore;
	}
	$averageTime = 0;
	if ($countTime > 0) {
		$averageTime = $totalTime / $countTime;
	}
	$averagePrediction = 0;
	if ($countPrediction > 0) {
		$averagePrediction = $totalPrediction / $countPrediction;
	}
	$averageResultScore = 181;
	if($countResultScore > 0) {
		$averageResultScore = $totalResultScore / $countResultScore;
	}
	$summary = array('avg_score'=>$averageScore,'avg_time'=>$averageTime,'avg_fifty_average'=>$averagePrediction,'avg_result_score'=>$averageResultScore);
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