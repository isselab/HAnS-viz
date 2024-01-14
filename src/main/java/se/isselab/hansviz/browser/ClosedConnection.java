// Copyright 2021 Kenny Bang, Johan Berg, Seif Bourogaa, Lucas Frövik, Alexander Grönberg, Sara Persson
package se.isselab.hansviz.browser;

import org.cef.callback.CefCallback;
import org.cef.misc.IntRef;
import org.cef.misc.StringRef;
import org.cef.network.CefResponse;

/**
 * A class representing a closed connection to a resource
 */
class ClosedConnection implements ResourceHandlerState {

    /**
     * Always responds status: 404 Not Found.
     */
    @Override
    public void getResponseHeaders(CefResponse cefResponse, IntRef responseLength, StringRef redirectUrl) {
        cefResponse.setStatus(404);
    }

    /**
     * A closed connection can't read responses and thus always return false
     * @return False
     */
    @Override
    public boolean readResponse(byte[] dataOut, int designedBytesToRead, IntRef bytesRead, CefCallback callback) {
        return false;
    }
}
