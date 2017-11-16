import { Router } from "express";
import { Provider } from "nconf";
import * as path from "path";
import * as git from "../../git-storage";
import * as utils from "../../utils";
import * as storage from "../storage";
import { defaultPartials } from "./partials";

const defaultTemplate = "pp.txt";

export function create(
    config: Provider,
    gitManager: git.GitManager,
    mongoManager: utils.MongoManager,
    producer: utils.kafkaProducer.IProducer): Router {
    const router: Router = Router();

    const documentsCollectionName = config.get("mongo:collectionNames:documents");

    /**
     * Loading of a specific collaborative map
     */
    router.get("/:id", (request, response, next) => {
        const workerConfig = JSON.stringify(config.get("worker"));

        const versionP = storage.getLatestVersion(gitManager, request.params.id);
        versionP.then(
            (version) => {
                const parsedTemplate = path.parse(request.query.template ? request.query.template : defaultTemplate);
                const template =
                    parsedTemplate.base !== "empty" ? `/public/literature/${parsedTemplate.base}` : undefined;

                response.render(
                    "sharedText",
                    {
                        config: workerConfig,
                        id: request.params.id,
                        partials: defaultPartials,
                        template,
                        title: request.params.id,
                        version: JSON.stringify(version),
                    });
            },
            (error) => {
                response.status(400).json(error);
            });
    });

    router.post("/:id/fork", (request, response, next) => {
        const forkP = storage.createFork(
            producer,
            gitManager,
            mongoManager,
            documentsCollectionName,
            request.params.id);
        forkP.then(
            (fork) => {
                response.redirect(`/sharedText/${fork}`);
            },
            (error) => {
                response.status(400).json(error);
            });
    });

    return router;
}
