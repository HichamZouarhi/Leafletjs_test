<?php

	$db = pg_connect('host=localhost dbname=Afriquia_Gaz user=postgres password=P0stgres');
	if (!$db){
		die("no connection to database ". pg_last_error());
	}

	$wkt=pg_escape_string($_POST['geometry']);

	$query = "insert into microzones ( geometry ) values ( ST_SetSRID(ST_GeomFromText('".$wkt."'), 4326))";
	$result = pg_query($query);

	echo "the query passed successfully";

	if (!$result) {
		die("Error with query: " . pg_last_error());
	}

	pg_close();
?> 
