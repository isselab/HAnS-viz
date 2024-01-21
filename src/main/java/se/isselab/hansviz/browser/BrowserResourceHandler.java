/*
Copyright 2021 Kenny Bang, Johan Berg, Seif Bourogaa, Lucas Frövik, Alexander Grönberg, Sara Persson
Copyright 2024 David Stechow & Philipp Kusmierz

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package se.isselab.hansviz.browser;

import org.cef.callback.CefCallback;
import org.cef.handler.CefResourceHandler;
import org.cef.misc.IntRef;
import org.cef.misc.StringRef;
import org.cef.network.CefRequest;
import org.cef.network.CefResponse;

import java.io.IOException;
import java.net.URL;

public class BrowserResourceHandler implements CefResourceHandler {
    private ResourceHandlerState state = new ClosedConnection();

    /**
     * Process URLRequest and replace URL into resource-folder location.
     * Opens Connection to file in resource folder.
     * @param cefRequest
     * @param cefCallback
     * @return
     */
    @Override
    public boolean processRequest(CefRequest cefRequest, CefCallback cefCallback) {
        String urlOption = cefRequest.getURL();

        if (urlOption != null) {
            String pathToResource = urlOption.replace("http://hans", "webcontent/");
            URL newUrl = getClass().getClassLoader().getResource(pathToResource);
            try {
                state = new OpenedConnection(newUrl.openConnection());
            } catch (IOException e) {
                e.printStackTrace();
            }
            cefCallback.Continue();
            return true;
        } else {
            return false;
        }
    }

    @Override
    public void getResponseHeaders(CefResponse cefResponse, IntRef intRef, StringRef stringRef) {
        state.getResponseHeaders(cefResponse, intRef, stringRef);
    }

    @Override
    public boolean readResponse(byte[] bytes, int i, IntRef intRef, CefCallback cefCallback) {
        try {
            return state.readResponse(bytes, i, intRef, cefCallback);
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public void cancel() {
        try {
            state.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        state = new ClosedConnection();
    }
}
