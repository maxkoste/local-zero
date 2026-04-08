import React from 'react'
import { Visibility } from './visibility'
import { ActionKey } from './action'

export interface User {
	id: number,
	username: string,
	password: string,
	email: string,
	visibility: Visibility,
	action?: ActionKey[], // maybe there should be a blank list
}

