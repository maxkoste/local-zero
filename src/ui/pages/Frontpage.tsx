import React from 'react';
import { useState } from 'react';
import { User } from '../../backend/user'
import { users } from '../../backend/controller'


//Denna funktionen exporteras och kan importeras genom att skriva:
//import {Hello} from './Frontpage'
export function Hello() {
	return (
		<div>
			<h1>Klicka på en av våra användare här nere! </h1>
			<MyButton />
		</div>
	);
}

function MyButton() {
	const [selected, setSelected] = useState<User | null>(null);

	let userInfo = null;
	if (selected != null){
		userInfo = (
			<div>
				<p> ID : {selected.id}</p>
				<p> Username : {selected.username}</p>
				<p> Email : {selected.email}</p>
				<p> Password : {selected.password}</p>
			</div>
		)
	}
	return (
		<div>
			<select onChange={e=>{
				const user = users.find(u => u.id === Number(e.target.value));
				setSelected(user ?? null);
			}}>
				{ users.map(u => (
					<option key={u.id} value={u.id}>{u.username}</option>
				))}

			</select>
			<div>
				{userInfo}
			</div>
		</div>
	);
}
