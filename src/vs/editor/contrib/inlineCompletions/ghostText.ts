/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IActiveCodeEditor } from 'vs/editor/browser/editorBrowser';
import { EditorOption } from 'vs/editor/common/config/editorOptions';

export class GhostText {
	constructor(
		public readonly lineNumber: number,
		public readonly parts: GhostTextPart[],
		public readonly additionalReservedLineCount: number = 0
	) {
	}
}

export interface GhostTextPart {
	readonly lines: string[];
	readonly column: number;
}


export interface GhostTextWidgetModel {
	readonly onDidChange: Event<void>;
	readonly ghostText: GhostText | undefined;

	setExpanded(expanded: boolean): void;
	readonly expanded: boolean;

	readonly minReservedLineCount: number;
}

export abstract class BaseGhostTextWidgetModel extends Disposable implements GhostTextWidgetModel {
	public abstract readonly ghostText: GhostText | undefined;

	private _expanded: boolean | undefined = undefined;

	protected readonly onDidChangeEmitter = new Emitter<void>();
	public readonly onDidChange = this.onDidChangeEmitter.event;

	public abstract readonly minReservedLineCount: number;

	public get expanded() {
		if (this._expanded === undefined) {
			// TODO this should use a global hidden setting.
			// See https://github.com/microsoft/vscode/issues/125037.
			return true;
		}
		return this._expanded;
	}

	constructor(protected readonly editor: IActiveCodeEditor) {
		super();

		this._register(editor.onDidChangeConfiguration((e) => {
			if (e.hasChanged(EditorOption.suggest) && this._expanded === undefined) {
				this.onDidChangeEmitter.fire();
			}
		}));
	}

	public setExpanded(expanded: boolean): void {
		this._expanded = true;
		this.onDidChangeEmitter.fire();
	}
}
