
<?php
	if(isset($_GET['key'])){
		print_r($_SERVER);
		
		echo "<br>";
		
		print_r($_GET);
	}else if(isset($_POST['key'])){
		$mydb = new mysqli("localhost", "ksirbj_ksirbj", "", "ksirbj_lyrical");
		
		if($mydb->connect_errno){
			echo $mydb->connect_errno;
			die($mydb->connect_errno);
		}
		$key = $mydb->real_escape_string($_POST['key']);
		$query = "SELECT * FROM keys WHERE key='%$key%'";
		$res = $mydb->query($query);
		if($res->num_rows == 0){
			echo "Invalid key";
			die("Invalid key");
		}else{
			$row = $res->fetch_assoc();
			$exp = $row['exp'];
		}

		$id = $mydb->real_escape_string($_POST['id']);
		if(strlen($id) < 5 ){
			echo "invalid ID";
			die("invalid ID");
		}

		$domain = $mydb->real_escape_string($_POST['domain']);
		$lyrics = $mydb->real_escape_string($_POST['lyrics']);
		$scroll_stamps = "[]";
		$url = $mydb->real_escape_string($_POST['url']);

		$query = "INSERT INTO lyrics(id, domain, lyrics, scroll_stamps, url) 
					VALUES ('$id', '$domain', '$lyrics', '$scroll_stamps', '$url')";

		$res = $mydb->query($query);
		if($res->error){
			echo $res->error;
			die($res->error);
		}else{
			echo $res->affected_rows;
		}		
	
	}else {
		print_r($_POST);
	}
?>