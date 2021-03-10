import { ContinuationLocalStorage } from 'asyncctx';

export class RequestContextModel {
	constructor() {
		this.requestId = Date.now();
	}

	requestId: number;
}

class RequestContextImpl {
	private static cls: ContinuationLocalStorage<RequestContextModel>;

	static get current(): RequestContextModel {
		if (!RequestContextImpl.cls) {
			RequestContextImpl.cls = new ContinuationLocalStorage<RequestContextModel>();
		}

		const context = RequestContextImpl.cls.getContext();

		if (!context) {
			return null;
		}

		return context;
	}

	static setContext(model: RequestContextModel) {
		if (!RequestContextImpl.cls) {
			RequestContextImpl.cls = new ContinuationLocalStorage<RequestContextModel>();
		}

		RequestContextImpl.cls.setContext(model);
	}
}

export class RequestContext {
	static get current(): RequestContextModel {
		return RequestContextImpl.current;
	}
}

export async function requestContextMiddleware(req: any, res: any, next: () => Promise<void>): Promise<void> {
	RequestContextImpl.setContext(new RequestContextModel());
	await next();
}
