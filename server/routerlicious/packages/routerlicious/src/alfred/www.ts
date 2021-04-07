/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from "path";
import * as winston from "winston";
import { configureLogging, runService } from "@fluidframework/server-services-utils";
import { AlfredResourcesFactory, AlfredRunnerFactory } from "@fluidframework/server-routerlicious-base";

const configPath = path.join(__dirname, "../../config/config.json");

configureLogging(configPath);

runService(
    new AlfredResourcesFactory(),
    new AlfredRunnerFactory(),
    winston,
    "alfred",
    configPath);
