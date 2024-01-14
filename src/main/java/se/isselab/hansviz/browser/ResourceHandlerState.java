// Copyright 2021 Kenny Bang, Johan Berg, Seif Bourogaa, Lucas Frövik, Alexander Grönberg, Sara Persson
package se.isselab.hansviz.browser;

import org.cef.callback.CefCallback;
import org.cef.misc.IntRef;
import org.cef.misc.StringRef;
import org.cef.network.CefResponse;

import java.io.IOException;

/**
 * Interface with methods needed in classes representing resource handlers
 */
interface ResourceHandlerState {
    default void getResponseHeaders(CefResponse cefResponse, IntRef responseLength, StringRef redirectUrl) { }
    default boolean readResponse(byte[] dataOut, int designedBytesToRead, IntRef bytesRead, CefCallback callback) throws IOException { return false;}
    default void close() throws IOException { }
}
