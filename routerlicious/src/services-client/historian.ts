import * as git from "gitresources";
import * as querystring from "querystring";
import * as request from "request";

/**
 * Implementation of the IHistorian interface that calls out to a REST interface
 */
export class Historian implements git.IHistorian {
    constructor(private endpoint: string) {
    }

    public getHeader(repo: string, sha: string): Promise<any> {
        return this.get(`/repos/${encodeURIComponent(repo)}/headers/${encodeURIComponent(sha)}`);
    }

    public getBlob(repo: string, sha: string): Promise<git.IBlob> {
        return this.get<git.IBlob>(`/repos/${encodeURIComponent(repo)}/git/blobs/${encodeURIComponent(sha)}`);
    }

    public createBlob(repo: string, blob: git.ICreateBlobParams): Promise<git.ICreateBlobResponse> {
        return this.post<git.ICreateBlobResponse>(`/repos/${encodeURIComponent(repo)}/git/blobs`, blob);
    }

    public getContent(repo: string, path: string, ref: string): Promise<any> {
        const query = querystring.stringify({ ref });
        return this.get(`/repos/${encodeURIComponent(repo)}/contents/${path}?${query}`);
    }

    public getCommits(repo: string, sha: string, count: number): Promise<git.ICommit[]> {
        const query = querystring.stringify({
            count,
            sha,
        });
        return this.get<git.ICommit[]>(`/repos/${encodeURIComponent(repo)}/commits?${query}`)
            .catch((error) => error === 400 ? [] as git.ICommit[] : Promise.reject<git.ICommit[]>(error));
    }

    public getCommit(repo: string, sha: string): Promise<git.ICommit> {
        return this.get<git.ICommit>(`/repos/${encodeURIComponent(repo)}/git/commits/${encodeURIComponent(sha)}`);
    }

    public createCommit(repo: string, commit: git.ICreateCommitParams): Promise<git.ICommit> {
        return this.post<git.ICommit>(`/repos/${encodeURIComponent(repo)}/git/commits`, commit);
    }

    public getRefs(repo: string): Promise<git.IRef[]> {
        return this.get(`/repos/${encodeURIComponent(repo)}/git/refs`);
    }

    public getRef(repo: string, ref: string): Promise<git.IRef> {
        return this.get(`/repos/${encodeURIComponent(repo)}/git/refs/${ref}`);
    }

    public createRef(repo: string, params: git.ICreateRefParams): Promise<git.IRef> {
        return this.post(`/repos/${encodeURIComponent(repo)}/git/refs`, params);
    }

    public updateRef(repo: string, ref: string, params: git.IPatchRefParams): Promise<git.IRef> {
        return this.patch(`/repos/${encodeURIComponent(repo)}/git/refs/${ref}`, params);
    }

    public async deleteRef(repo: string, ref: string): Promise<void> {
        await this.delete(`/repos/${encodeURIComponent(repo)}/git/refs/${ref}`);
    }

    public createRepo(repo: git.ICreateRepoParams): Promise<any> {
        return this.post(`/repos`, repo);
    }

    public getRepo(repo: string): Promise<any> {
        return this.get(`/repos/${encodeURIComponent(repo)}`)
            .catch((error) => error === 400 ? null : Promise.resolve(error));
    }

    public createTag(repo: string, tag: git.ICreateTagParams): Promise<git.ITag> {
        return this.post(`/repos/${encodeURIComponent(repo)}/git/tags`, tag);
    }

    public getTag(repo: string, tag: string): Promise<git.ITag> {
        return this.get(`/repos/${encodeURIComponent(repo)}/git/tags/${tag}`);
    }

    public createTree(repo: string, tree: git.ICreateTreeParams): Promise<git.ITree> {
        return this.post<git.ITree>(`/repos/${encodeURIComponent(repo)}/git/trees`, tree);
    }

    public getTree(repo: string, sha: string, recursive: boolean): Promise<git.ITree> {
        const query = querystring.stringify({ recursive: recursive ? 1 : 0 });
        return this.get<git.ITree>(
            `/repos/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(sha)}?${query}`);
    }

    private get<T>(url: string): Promise<T> {
        const options: request.OptionsWithUrl = {
            json: true,
            method: "GET",
            url: `${this.endpoint}${url}`,
        };
        return this.request(options, 200);
    }

    private post<T>(url: string, requestBody: any): Promise<T> {
        const options: request.OptionsWithUrl = {
            body: requestBody,
            headers: {
                "Content-Type": "application/json",
            },
            json: true,
            method: "POST",
            url: `${this.endpoint}${url}`,
        };
        return this.request(options, 201);
    }

    private delete<T>(url: string): Promise<T> {
        const options: request.OptionsWithUrl = {
            method: "DELETE",
            url: `${this.endpoint}${url}`,
        };
        return this.request(options, 204);
    }

    private patch<T>(url: string, requestBody: any): Promise<T> {
        const options: request.OptionsWithUrl = {
            body: requestBody,
            headers: {
                "Content-Type": "application/json",
            },
            json: true,
            method: "PATCH",
            url: `${this.endpoint}${url}`,
        };
        return this.request(options, 200);
    }

    private request<T>(options: request.OptionsWithUrl, statusCode: number): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            request(
                options,
                (error, response, body) => {
                    if (error) {
                        return reject(error);
                    } else if (response.statusCode !== statusCode) {
                        return reject(response.statusCode);
                    } else {
                        return resolve(response.body);
                    }
                });
        });
    }
}
