import { Visibility } from './visibility'
import type { ActionKey } from './action'
import { Notification } from './notification'

export interface User {
	id: number,
	username: string,
	password: string,
	email: string,
	visibility: Visibility,
	action: ActionKey[],
	notification: Notification[],
}
