// Copyright 2021 Kenny Bang, Johan Berg, Seif Bourogaa, Lucas Frövik, Alexander Grönberg, Sara Persson

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

// https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.github.johmara.hansviz;

import com.intellij.openapi.Disposable;
import com.intellij.openapi.project.Project;

/**
 * Service providing the HansViewerWindow
 * @see BrowserViewerWindow
 */
public class BrowserViewerService implements Disposable {

    public BrowserViewerWindow browserViewerWindow;

    /**
     * Constructs the service providing the Feature Location view and Tangling view
     * @param project The project which the service is used in
     */
    public BrowserViewerService(Project project) {
        browserViewerWindow = new BrowserViewerWindow(this, project);
    }

    /**
     * Disposes the HansViewerWindow
     */
    @Override
    public void dispose() {
        browserViewerWindow = null;
    }
}
