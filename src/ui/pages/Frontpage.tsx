import React from 'react';
import { useState } from 'react';


//Denna funktionen exporteras och kan importeras genom att skriva:
//import {Hello} from './Frontpage'
export function Hello() {
	return (
		<div>
			<h1>Counters that update because im trying stuff</h1>
			<MyButton/>
			<MyButton/>
			<MyButton/>
		</div>
	);
}

function MyButton(){
	const[count, setCount] = useState(0);

	//Det går att ha funktioner i funktioner!! Crazy shit man
	function handleClick() {
		setCount(count + 1);
	}

	return (
		<button onClick={handleClick}> 
			Clicked {count} times
		</button>
	);
}
