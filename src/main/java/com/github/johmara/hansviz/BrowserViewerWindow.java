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

import com.intellij.openapi.project.Project;
import com.intellij.openapi.util.Disposer;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.psi.PsiFile;
import com.intellij.psi.PsiFileSystemItem;
import com.intellij.psi.search.FilenameIndex;
import com.intellij.psi.search.GlobalSearchScope;
import com.intellij.ui.jcef.JBCefBrowser;
import org.cef.CefApp;

import javax.swing.*;

/**
 * A class creating the JCEF browser used as content in a ToolWindow
 */
public class BrowserViewerWindow {

    private final JBCefBrowser webView;

    private final Box content;
    private final Project project;
    private String tangleFeature = "";
    private String locationFeature = "";

    /**
     * Constructs a JCEF view containing the Feature Localisation View and Tangling View
     * @param service The parent service of the view
     * @param project The project the view is for
     */
    public BrowserViewerWindow(BrowserViewerService service, Project project) {
        webView = new JBCefBrowser();
        registerAppSchemeHandler();
        webView.loadURL("http://hans/index.html");

        /**
         * Helps IDE with memory management -> avoid "Memory leak detected"
         */
        Disposer.register(service, webView);


        // Setup the menubar in JCEF
        JMenuBar menuBar = new JMenuBar();
        /*JMenuItem fileMenuItem = new JMenuItem("Feature Location Visualization");
        JMenuItem tanglingMenuItem = new JMenuItem("Feature Tangling Visualization");
        JBColor menuItemColor = new JBColor(
                fileMenuItem.getBackground(), fileMenuItem.getBackground());*/


        /*MouseAdapter miMouseAdapter = new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                String url = "http://myapp/html/";
                if (e.getComponent() == fileMenuItem) {
                    url += "fileView.html";
                    locationFeature = "";
                } else if (e.getComponent() == tanglingMenuItem) {
                    try {
                        String featureTangling = JSONHandler.toJSONString(iFeatureAnnotationUtil.getFeatureAnnotationTanglings(project.getBasePath()));
                    } catch (IOException ioException) {
                        ioException.printStackTrace();
                    }
                    url += "tanglingView.html";
                }
                webView.loadURL(url);
            }

            @Override
            public void mouseEntered(MouseEvent e) {
                e.getComponent().setBackground(JBColor.CYAN);
            }

            @Override
            public void mouseExited(MouseEvent e) {
                e.getComponent().setBackground(menuItemColor);
            }
        };*/
        /*fileMenuItem.addMouseListener(miMouseAdapter);
        tanglingMenuItem.addMouseListener(miMouseAdapter);*/

        /*menuBar.add(fileMenuItem);
        menuBar.add(tanglingMenuItem);*/
        content = new Box(BoxLayout.Y_AXIS);
        content.add(menuBar);
        content.add(webView.getComponent());
        this.project = project;
    }

    private void registerAppSchemeHandler() {
        CefApp.getInstance().registerSchemeHandlerFactory(
                "http",
                "hans",
                new BrowserSchemeHandlerFactory()
        );
    }

    /**
     * Gets the JCEF browser
     * @return The JCEF browser as a JComponent.
     */
    public JComponent content() {
        System.out.println("return content");
        return content;
    }

    /**
     * Register a new SchemeHandlerFactory using CustomSchemeHandlerFactory
     */
    /*private void registerAppSchemeHandler() {
        CefApp.getInstance().registerSchemeHandlerFactory(
                "http",
                "myapp",
                new CustomSchemeHandlerFactory()
        );
    }*/

    /**
     * Makes a client able to process JS requests
     * @param client The browser client that should handle JS requests
     */
    /*private void handleJS(CefClient client) {
        // Query a route configuration, html pages used window.java ({}) and window.javaCancel ({}) to call this method
        CefMessageRouter.CefMessageRouterConfig cmrConfig = new CefMessageRouter.CefMessageRouterConfig(
                "java","javaCancel");
        // Create query routing
        CefMessageRouter cmr = CefMessageRouter.create(cmrConfig);
        cmr.addHandler(new CefMessageRouterHandler() {

            @Override
            public void setNativeRef(String str, long val) {
                System.out.println(str+"  "+val);
            }

            @Override
            public long getNativeRef(String str) {
                System.out.println(str);
                return 0;
            }

            @Override
            public void onQueryCanceled(CefBrowser browser, CefFrame frame, long query_id) {
                System.out.println("Cancel the query:" + query_id);
            }

            @Override
            public boolean onQuery(CefBrowser browser, CefFrame frame, long query_id, String request,
                                   boolean persistent, CefQueryCallback callback) {
                System.out.println("Request:"+request+"\nQuery_id:"+query_id+"\nPersistent:"+persistent);

                String[] temp = request.split(" ");
                String cmd = temp[0];
                boolean handled = false;
                String cbSyntaxFailureMsg = "\"Message syntax incorrect!\nCorrect syntax: ";
                String debugSyntax = "Debug <data>";
                String deleteFeSyntax = "DeleteFe <featureName>";
                String deleteFiSyntax = "DeleteFi <fileName>";
                String getDataSyntax = "getData [feature | tangle]";
                String openSyntax = "OpenFile <fileName>";
                String renameFeSyntax = "RenameFe <oldName> <newName>";
                String renameFiSyntax = "RenameFi <oldName> <newName>";
                *//* Supported operations:
                 * - Debug:
                 *      Description: Print data to java console (Used for debug purposes)
                 *      Syntax: Debug <data>
                 * - DeleteFe:
                 *      Description: Deletes a feature
                 *      Syntax: DeleteFe <featureName>
                 * - DeleteFi:
                 *      Description: Deletes a file/folder
                 *      Syntax: DeleteFi <fileName/folderName>
                 * - GetData:
                 *      Description: Requests data for feature- or tangleview
                 *      Syntax: GetData [feature | tangle]
                 * - OpenFile:
                 *      Description: Opens a file in editor or expands folder in project view
                 *      Syntax: OpenFile <fileName/folderName>
                 * - RenameFe:
                 *      Description: Renames a feature
                 *      Syntax: RenameFe <oldName> <newName>
                 * - RenameFi:
                 *      Description: Renames a file
                 *      Syntax: RenameFi <oldFileName> <newFileName>
                 *//*
                switch (cmd) {
                    case "Debug":
                        try {
                            String data = temp[1];
                            System.out.println(data);
                            callback.success("Debug message '" + data + "' was received!");
                            handled = true;
                        } catch (IndexOutOfBoundsException e) {
                            // Incorrect syntax
                            callback.failure(400, cbSyntaxFailureMsg + debugSyntax);
                        }
                        break;
                    case "DeleteFe":
                        try {
                            String featureName = temp[1];
                            // TODO: Implement actual deletion of feature (require editing API)
                            callback.success(featureName + " was deleted!");
                            handled = true;
                        } catch (IndexOutOfBoundsException e) {
                            // Incorrect syntax
                            callback.failure(400, cbSyntaxFailureMsg + deleteFeSyntax);
                        }
                        break;
                    case "DeleteFi":
                        try {
                            String fileName = temp[1];
                            // Send handling of deleting file to be processed by an EDT thread when available
                            ApplicationManager.getApplication().invokeLater(() -> {
                                final VirtualFile vFile = getVirtualFile(fileName);
                                if (vFile != null) {
                                    ApplicationManager.getApplication().runWriteAction(() -> {
                                        try {
                                            vFile.delete(this);
                                            callback.success(fileName + " was deleted!");
                                        } catch (IOException e) {
                                            // Failed to delete
                                            callback.failure(500, fileName + "could not be deleted!");
                                        }
                                    });
                                } else {
                                    // File/Folder not found
                                    callback.failure(404, fileName + " could not be found!");
                                }
                            });
                            handled = true;
                        } catch (IndexOutOfBoundsException e) {
                            // Incorrect syntax
                            callback.failure(400, cbSyntaxFailureMsg + deleteFiSyntax);
                        }
                        break;
                    case "GetData":
                        try {
                            String requestedData = temp[1];
                            if (requestedData.equals("feature")) {
                                // TODO: Assign actual data to fileData string
                                String fileData = "fileViewData test";
                                callback.success(fileData);
                            } else if (requestedData.equals("tangle")) {
                                // TODO: Assign actual data to tangleData string
                                String tangleData = "tangleViewData test";
                                callback.success(tangleData);
                            } else {
                                // Requested data was not a supported datatype
                                // Must be either feature or tangle
                                callback.failure(400, requestedData + " is not a valid datatype!");
                            }
                            handled = true;
                        } catch (IndexOutOfBoundsException e) {
                            // Incorrect syntax
                            callback.failure(400, cbSyntaxFailureMsg + getDataSyntax);
                        }
                        break;
                    case "OpenFile":
                        try {
                            String fileName = temp[1];
                            // Send handling of file opening to be processed by an EDT thread when available
                            ApplicationManager.getApplication().invokeLater(() -> {
                                final VirtualFile vFile = getVirtualFile(fileName);
                                if (vFile != null) {
                                    OpenFileDescriptor ofd = new OpenFileDescriptor(project, vFile);
                                    boolean isDir = vFile.isDirectory();
                                    ofd.navigate(!isDir);
                                    String cbMsg = isDir ? "expanded " : "opened ";
                                    cbMsg += fileName;
                                    callback.success(cbMsg);
                                } else {
                                    // File/Folder not found
                                    callback.failure(404, fileName + " could not be found!");
                                }
                            });
                            handled = true;
                        } catch (IndexOutOfBoundsException e) {
                            // Incorrect syntax
                            callback.failure(400, cbSyntaxFailureMsg + openSyntax);
                        }
                        break;
                    case "RenameFe":
                        try {
                            String oldName = temp[1];
                            String newName = temp[2];
                            // TODO: Implement actual renaming of feature (require editing API)
                            callback.success(oldName + " was renamed to " + newName);
                            handled = true;
                        } catch (IndexOutOfBoundsException e) {
                            // Incorrect syntax
                            callback.failure(400, cbSyntaxFailureMsg + renameFeSyntax);
                        }
                        break;
                    case "RenameFi":
                        try {
                            String oldName = temp[1];
                            String newName = temp[2];
                            // Send handling of file renaming to be processed by an EDT thread when available
                            ApplicationManager.getApplication().invokeLater(() -> {
                                final VirtualFile vFile = getVirtualFile(oldName);
                                if (vFile != null) {
                                    ApplicationManager.getApplication().runWriteAction(() -> {
                                        try {
                                            vFile.rename(this, newName);
                                            callback.success(oldName + " was renamed to " + newName);
                                        } catch (IOException e) {
                                            // Failed to rename
                                            callback.failure(500, oldName + "could not be renamed!");
                                        }
                                    });
                                } else {
                                    // File/Folder not found
                                    callback.failure(404, oldName + " could not be found!");
                                }
                            });
                            handled = true;
                        } catch (IndexOutOfBoundsException e) {
                            // Incorrect syntax
                            callback.failure(400, cbSyntaxFailureMsg + renameFiSyntax);
                        }
                        break;
                    case "featureLocation":
                        try {
                            String featureLocation = "";
                            System.out.println(locationFeature);
                            if(locationFeature.equals("")) {
                                featureLocation = JSONHandler.toJSONString(iFeatureAnnotationUtil.getFeatureAnnotationLocations(project.getBasePath()));
                            }
                            else {
                                Map<String, ArrayList<Object>> featureMap = new HashMap<>();
                                ArrayList<Object> locationsForFeature = iFeatureAnnotationUtil.getFeatureAnnotationLocations(project.getBasePath()).get(locationFeature);
                                featureMap.put(locationFeature, locationsForFeature);
                                featureLocation = JSONHandler.toJSONString(featureMap);
                            }
                            System.out.println(featureLocation);
                            callback.success(featureLocation);
                            handled = true;
                        } catch (IndexOutOfBoundsException | IOException e) {
                           callback.failure(400, "Could not get feature mappings.");
                        }
                        break;
                    case "OpenTangle":      //Used by featureView.js to get the chosen feature
                        try {
                            Map<String, ArrayList<Object>> test = iFeatureAnnotationUtil.getFeatureAnnotationTanglings(project.getBasePath());
                            Map<String, ArrayList<Object>>mapper = new HashMap<>();
                            if(test.containsKey(tangleFeature)) {
                                mapper.put(tangleFeature, test.get(tangleFeature));
                            } else
                            {
                                mapper.put(tangleFeature, new ArrayList<>());
                            }
                            String json = JSONHandler.toJSONString(mapper);
                            System.out.println(json);
                            callback.success(json);
                            handled = true;
                        }  catch (IOException ioException) {
                            //
                            ioException.printStackTrace();
                            callback.failure(400, cbSyntaxFailureMsg + "Wrong with tangling");
                        }
                        break;
                    case "ChooseTangle":    //Should be used from location view to choose the tangle feature
                        try {
                            tangleFeature = temp[1];
                            String url = "http://myapp/html/";
                            url += "tanglingView.html";
                            webView.loadURL(url);
                            callback.success("Choose feature for tangling view success");
                            handled = true;
                        } catch (IndexOutOfBoundsException e) {
                            // Incorrect syntax
                            callback.failure(400, cbSyntaxFailureMsg + "ChooseTangle <featureName>"); //Syntax for choosing the feature
                        }
                        break;
                    case "OpenLocation":
                        locationFeature = temp[1];
                        String url = "http://myapp/html/";
                        url += "fileView.html";
                        webView.loadURL(url);
                        handled = true;
                        break;
                    default:
                        // Command not recognized
                        callback.failure(400, "Command not recognized!");
                }
                return handled;
            }
        }, true);
        client.addMessageRouter(cmr);
    }*/

    /**
     * Searches the project for a file (or folder) with the specified filename
     * and returns it as a VirtualFile.
     * (Currently does not support to find the correct file when multiple files
     * with the same name exists)
     * @param fileName The name of the file (or folder) that should be returned
     * @return A file (or folder) as a VirtualFile
     *
     */
    private VirtualFile getVirtualFile(String fileName) {
        // Try and return a file
        PsiFile[] allFilenames = FilenameIndex.getFilesByName(
                project, fileName, GlobalSearchScope.projectScope(project));
        if (allFilenames.length > 0) {
            return allFilenames[0].getVirtualFile();
        }
        // Try and return a folder
        PsiFileSystemItem[] allFoldernames = FilenameIndex.getFilesByName(
                project, fileName, GlobalSearchScope.projectScope(project), true);
        if (allFoldernames.length > 0) {
            return allFoldernames[0].getVirtualFile();
        }
        // No file/folder found
        return null;
    }
}
